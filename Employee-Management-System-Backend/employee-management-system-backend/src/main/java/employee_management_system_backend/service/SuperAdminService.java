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
import employee_management_system_backend.entity.Company;
import employee_management_system_backend.entity.User;
import employee_management_system_backend.exception.ResourceAlreadyExistsException;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.repository.AuditLogRepository;
import employee_management_system_backend.repository.CompanyRepository;
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
    private CompanyRepository companyRepository;

    @Autowired
    private CompanyService companyService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private AuditLogService auditLogService;

    public SuperAdminStatsDTO getSuperAdminStats() {
        long totalAdmins = userRepository.findByRole("ADMIN").size();
        long totalEmployees = employeeRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalAuditLogs = auditLogRepository.count();
        long totalCompanies = companyRepository.count();

        return new SuperAdminStatsDTO(
                totalAdmins,
                totalEmployees,
                totalDepartments,
                totalAuditLogs,
                totalCompanies
        );
    }

    public List<AdminDTO> getAllAdmins() {
        return userRepository.findByRole("ADMIN")
                .stream()
                .map(this::toAdminDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminDTO createAdmin(CreateAdminRequest request, String superAdminEmail) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);
        String normalizedName = request.getFullName().trim();

        if (userRepository.findByEmail(normalizedEmail) != null) {
            throw new ResourceAlreadyExistsException("A user with this email already exists: " + normalizedEmail);
        }

        Company company = null;
        if (request.getCompanyId() != null) {
            company = companyRepository.findById(request.getCompanyId()).orElse(null);
        } else if (request.getCompanyName() != null && !request.getCompanyName().trim().isEmpty()) {
            company = companyService.getOrCreateCompanyByName(request.getCompanyName());
        }

        User user = new User();
        user.setFullName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setPassword(request.getPassword());
        user.setRole("ADMIN");
        user.setActive(true);
        user.setCompany(company);
        if (request.getDesignation() != null && !request.getDesignation().trim().isEmpty()) {
            user.setDesignation(request.getDesignation().trim());
        } else {
            user.setDesignation("HR Administrator");
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            user.setPhoneNumber(request.getPhoneNumber().trim());
        }

        if (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty()) {
            user.setEmployeeId(request.getEmployeeId().trim());
        }

        User saved = userRepository.save(user);

        if (saved.getEmployeeId() == null || saved.getEmployeeId().isBlank()) {
            String prefix = company != null && company.getCode() != null && !company.getCode().isBlank()
                    ? company.getCode().trim()
                    : "ADM";
            saved.setEmployeeId(prefix + "-" + String.format("%04d", saved.getId()));
            saved = userRepository.save(saved);
        }

        User superAdmin = userRepository.findByEmail(superAdminEmail);
        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.AUTH,
                saved.getId().toString(),
                "Super Admin created new Administrator: " + saved.getFullName() + " (" + saved.getEmail() + ")"
                        + (company != null ? " for Company: " + company.getName() : "")
                        + (saved.getDesignation() != null ? " with Designation: " + saved.getDesignation() : "")
                        + (saved.getEmployeeId() != null ? " [ID: " + saved.getEmployeeId() + "]" : "")
                        + (saved.getPhoneNumber() != null ? " [Phone: " + saved.getPhoneNumber() + "]" : ""),
                superAdmin
        );

        return toAdminDTO(saved);
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

        if (request.getCompanyId() != null) {
            Company company = companyRepository.findById(request.getCompanyId()).orElse(null);
            admin.setCompany(company);
        } else if (request.getCompanyName() != null && !request.getCompanyName().trim().isEmpty()) {
            Company company = companyService.getOrCreateCompanyByName(request.getCompanyName());
            admin.setCompany(company);
        }

        if (request.getDesignation() != null) {
            admin.setDesignation(request.getDesignation().trim());
        }

        if (request.getPhoneNumber() != null) {
            admin.setPhoneNumber(request.getPhoneNumber().trim().isEmpty() ? null : request.getPhoneNumber().trim());
        }

        if (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty()) {
            admin.setEmployeeId(request.getEmployeeId().trim());
        }

        User saved = userRepository.save(admin);

        User superAdmin = userRepository.findByEmail(superAdminEmail);
        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.AUTH,
                saved.getId().toString(),
                "Super Admin updated Administrator details: " + saved.getFullName() + " (" + saved.getEmail() + ")",
                superAdmin
        );

        return toAdminDTO(saved);
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

        return toAdminDTO(saved);
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

        User superAdmin = superAdminEmail != null ? userRepository.findByEmail(superAdminEmail) : null;
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

    private AdminDTO toAdminDTO(User user) {
        Long companyId = user.getCompany() != null ? user.getCompany().getId() : null;
        String companyName = user.getCompany() != null ? user.getCompany().getName() : null;
        return new AdminDTO(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getActive(),
                companyId,
                companyName,
                user.getDesignation(),
                user.getPhoneNumber(),
                user.getEmployeeId()
        );
    }
}
