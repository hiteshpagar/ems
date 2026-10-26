package employee_management_system_backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import employee_management_system_backend.dto.AdminDTO;
import employee_management_system_backend.dto.CreateAdminRequest;
import employee_management_system_backend.dto.ResetAdminPasswordRequest;
import employee_management_system_backend.dto.SuperAdminStatsDTO;
import employee_management_system_backend.dto.UpdateAdminRequest;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.entity.User;
import employee_management_system_backend.exception.ResourceAlreadyExistsException;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.repository.AuditLogRepository;
import employee_management_system_backend.repository.DepartmentRepository;
import employee_management_system_backend.repository.EmployeeRepository;
import employee_management_system_backend.repository.UserRepository;

@Service
public class SuperAdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AuditLogService auditLogService;

    public SuperAdminStatsDTO getSuperAdminStats() {
        long totalAdmins = userRepository.findByRole("ADMIN").size();
        long totalEmployees = employeeRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalAuditLogs = auditLogRepository.count();

        return new SuperAdminStatsDTO(
                totalAdmins,
                totalEmployees,
                totalDepartments,
                totalAuditLogs
        );
    }

    public List<AdminDTO> getAllAdmins() {
        return userRepository.findByRole("ADMIN")
                .stream()
                .map(u -> new AdminDTO(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getActive()))
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminDTO createAdmin(CreateAdminRequest request, String superAdminEmail) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String normalizedName = request.getFullName().trim();

        if (userRepository.findByEmail(normalizedEmail) != null) {
            throw new ResourceAlreadyExistsException("A user with this email already exists: " + normalizedEmail);
        }

        User user = new User();
        user.setFullName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setPassword(request.getPassword());
        user.setRole("ADMIN");
        user.setActive(true);

        User saved = userRepository.save(user);

        User superAdmin = userRepository.findByEmail(superAdminEmail);
        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.AUTH,
                saved.getId().toString(),
                "Super Admin created new Administrator: " + saved.getFullName() + " (" + saved.getEmail() + ")",
                superAdmin
        );

        return new AdminDTO(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole(), saved.getActive());
    }

    @Transactional
    public AdminDTO updateAdmin(Long id, UpdateAdminRequest request, String superAdminEmail) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator not found with id: " + id));

        if (!"ADMIN".equals(admin.getRole())) {
            throw new IllegalArgumentException("Target user is not an administrator.");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String normalizedName = request.getFullName().trim();

        User existingWithEmail = userRepository.findByEmail(normalizedEmail);
        if (existingWithEmail != null && !existingWithEmail.getId().equals(id)) {
            throw new ResourceAlreadyExistsException("Email already in use: " + normalizedEmail);
        }

        admin.setFullName(normalizedName);
        admin.setEmail(normalizedEmail);
        User saved = userRepository.save(admin);

        User superAdmin = userRepository.findByEmail(superAdminEmail);
        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.AUTH,
                saved.getId().toString(),
                "Super Admin updated Administrator details: " + saved.getFullName() + " (" + saved.getEmail() + ")",
                superAdmin
        );

        return new AdminDTO(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole(), saved.getActive());
    }

    @Transactional
    public AdminDTO toggleAdminStatus(Long id, String superAdminEmail) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator not found with id: " + id));

        if ("SUPER_ADMIN".equalsIgnoreCase(admin.getRole()) || (superAdminEmail != null && superAdminEmail.equalsIgnoreCase(admin.getEmail()))) {
            throw new IllegalArgumentException("Cannot change Super Administrator status.");
        }

        if (!"ADMIN".equals(admin.getRole())) {
            throw new IllegalArgumentException("Target user is not an administrator.");
        }

        boolean newStatus = !admin.getActive();
        admin.setActive(newStatus);
        User saved = userRepository.save(admin);

        User superAdmin = userRepository.findByEmail(superAdminEmail);
        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.AUTH,
                saved.getId().toString(),
                "Super Admin " + (newStatus ? "activated" : "deactivated") + " Administrator: " + saved.getFullName() + " (" + saved.getEmail() + ")",
                superAdmin
        );

        return new AdminDTO(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole(), saved.getActive());
    }

    @Transactional
    public void deleteAdmin(Long id, String superAdminEmail) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator not found with id: " + id));

        if ("SUPER_ADMIN".equalsIgnoreCase(admin.getRole()) || (superAdminEmail != null && superAdminEmail.equalsIgnoreCase(admin.getEmail()))) {
            throw new IllegalArgumentException("Cannot delete Super Administrator account.");
        }

        if (!"ADMIN".equals(admin.getRole())) {
            throw new IllegalArgumentException("Target user is not an administrator.");
        }

        userRepository.delete(admin);

        User superAdmin = userRepository.findByEmail(superAdminEmail);
        auditLogService.log(
                AuditAction.DELETE,
                AuditModule.AUTH,
                id.toString(),
                "Super Admin removed Administrator: " + admin.getFullName() + " (" + admin.getEmail() + ")",
                superAdmin
        );
    }

    @Transactional
    public void resetAdminPassword(Long id, ResetAdminPasswordRequest request, String superAdminEmail) {
        User admin = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Administrator not found with id: " + id));

        if (!"ADMIN".equals(admin.getRole())) {
            throw new IllegalArgumentException("Target user is not an administrator.");
        }

        admin.setPassword(request.getNewPassword());
        userRepository.save(admin);

        User superAdmin = userRepository.findByEmail(superAdminEmail);
        auditLogService.log(
                AuditAction.PASSWORD_RESET,
                AuditModule.AUTH,
                admin.getId().toString(),
                "Super Admin reset password for Administrator: " + admin.getEmail(),
                superAdmin
        );
    }
}
