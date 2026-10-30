package com.ems.service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ems.dto.AdminCompanyOverviewDTO;
import com.ems.dto.CreateHrRequest;
import com.ems.dto.HrDTO;
import com.ems.dto.UpdateCompanyProfileRequest;
import com.ems.dto.UpdateHrRequest;
import com.ems.entity.AuditAction;
import com.ems.entity.AuditModule;
import com.ems.entity.Company;
import com.ems.entity.Hr;
import com.ems.entity.User;
import com.ems.exception.ResourceAlreadyExistsException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.CompanyRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.HrRepository;
import com.ems.repository.UserRepository;

@Service
public class AdminService {

    private static final String TEMP_PASSWORD_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    private static final SecureRandom RANDOM = new SecureRandom();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private HrRepository hrRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private EmployeeService employeeService;

    /**
     * Resolves the Company entity associated with the currently authenticated Company Admin.
     */
    public Company getAdminCompany(String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail);
        if (admin == null) {
            throw new ResourceNotFoundException("Administrator account not found: " + adminEmail);
        }
        if (admin.getCompany() == null) {
            throw new IllegalStateException("Administrator is not associated with any registered company.");
        }
        return admin.getCompany();
    }

    /**
     * Returns company overview metrics for the Admin Dashboard.
     */
    @Transactional(readOnly = true)
    public AdminCompanyOverviewDTO getCompanyOverview(String adminEmail) {
        Company company = getAdminCompany(adminEmail);
        Long companyId = company.getId();

        long totalHrs = hrRepository.countByCompanyId(companyId);
        long activeHrs = hrRepository.countByCompanyIdAndActive(companyId, true);
        long totalEmployees = employeeRepository.countByCompanyId(companyId);

        AdminCompanyOverviewDTO dto = new AdminCompanyOverviewDTO();
        dto.setCompanyId(company.getId());
        dto.setCompanyName(company.getName());
        dto.setCompanyCode(company.getCode());
        dto.setEmail(company.getEmail());
        dto.setPhone(company.getPhone());
        dto.setAddress(company.getAddress());
        dto.setWebsite(company.getWebsite());
        dto.setIndustry(company.getIndustry());
        dto.setRegistrationNumber(company.getRegistrationNumber());
        dto.setCity(company.getCity());
        dto.setState(company.getState());
        dto.setPostalCode(company.getPostalCode());
        dto.setCountry(company.getCountry());
        dto.setCreatedAt(company.getCreatedAt());

        dto.setTotalHrs(totalHrs);
        dto.setActiveHrs(activeHrs);
        dto.setTotalEmployees(totalEmployees);

        return dto;
    }

    /**
     * List all HRs under the authenticated Admin's company.
     */
    @Transactional(readOnly = true)
    public List<HrDTO> getCompanyHrs(String adminEmail) {
        Company company = getAdminCompany(adminEmail);
        return userRepository.findByCompanyIdAndRole(company.getId(), "HR")
                .stream()
                .map(this::toHrDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get specific HR by id, verifying tenant boundary.
     */
    @Transactional(readOnly = true)
    public HrDTO getCompanyHrById(Long hrId, String adminEmail) {
        Company company = getAdminCompany(adminEmail);
        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found with id: " + hrId));

        validateHrBelongsToCompany(hr, company);
        return toHrDTO(hr);
    }

    /**
     * Create a new HR user for the Admin's company with auto-generated temporary password and welcome email.
     */
    @Transactional
    public HrDTO createHr(CreateHrRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail);
        if (admin == null) {
            throw new ResourceNotFoundException("Administrator not found: " + adminEmail);
        }
        Company company = getAdminCompany(adminEmail);

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedName = request.getFullName().trim();

        if (userRepository.findByEmail(normalizedEmail) != null) {
            throw new ResourceAlreadyExistsException("A user with this email already exists: " + normalizedEmail);
        }

        String rawPassword = (request.getPassword() != null && !request.getPassword().trim().isEmpty())
                ? request.getPassword().trim()
                : generateSecureTempPassword();

        User hr = new User();
        hr.setFullName(normalizedName);
        hr.setEmail(normalizedEmail);
        hr.setPassword(rawPassword);
        hr.setRole("HR");
        hr.setActive(true);
        hr.setPasswordChangeRequired(true);
        hr.setCompany(company);

        if (request.getDesignation() != null && !request.getDesignation().trim().isEmpty()) {
            hr.setDesignation(request.getDesignation().trim());
        } else {
            hr.setDesignation("HR Manager");
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().trim().isEmpty()) {
            hr.setPhoneNumber(request.getPhoneNumber().trim());
        }

        if (request.getEmployeeId() != null && !request.getEmployeeId().trim().isEmpty()) {
            hr.setEmployeeId(request.getEmployeeId().trim());
        }

        User saved = userRepository.save(hr);

        // Auto-assign HR Employee ID if missing
        if (saved.getEmployeeId() == null || saved.getEmployeeId().isBlank()) {
            String prefix = company.getCode() != null && !company.getCode().isBlank()
                    ? company.getCode().trim() + "-HR"
                    : "HR";
            saved.setEmployeeId(prefix + "-" + String.format("%04d", saved.getId()));
            saved = userRepository.save(saved);
        }

        // Synchronize into dedicated hrs table
        Hr hrProfile = hrRepository.findByUserId(saved.getId());
        if (hrProfile == null) {
            hrProfile = hrRepository.findByEmailIgnoreCase(saved.getEmail());
        }
        if (hrProfile == null) {
            hrProfile = new Hr();
        }
        hrProfile.setUser(saved);
        hrProfile.setCompany(company);
        hrProfile.setName(saved.getFullName());
        hrProfile.setEmail(saved.getEmail());
        hrProfile.setPhone(saved.getPhoneNumber());
        hrProfile.setDepartment("Human Resources");
        hrProfile.setDesignation(saved.getDesignation());
        hrProfile.setHrCode(saved.getEmployeeId());
        hrProfile.setActive(saved.getActive());
        hrRepository.save(hrProfile);

        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.AUTH,
                saved.getId().toString(),
                "Company Admin (" + admin.getEmail() + ") created new HR: " + saved.getFullName()
                        + " (" + saved.getEmail() + ") for Company: " + company.getName(),
                admin
        );

        try {
            emailService.sendHrOnboardingEmail(saved, company, rawPassword);
        } catch (Exception ignored) {
        }

        return toHrDTO(saved);
    }

    /**
     * Update an HR's profile details.
     */
    @Transactional
    public HrDTO updateHr(Long hrId, UpdateHrRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail);
        Company company = getAdminCompany(adminEmail);

        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found with id: " + hrId));

        validateHrBelongsToCompany(hr, company);

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (!hr.getEmail().equalsIgnoreCase(normalizedEmail)) {
            User existing = userRepository.findByEmail(normalizedEmail);
            if (existing != null && !existing.getId().equals(hr.getId())) {
                throw new ResourceAlreadyExistsException("Email is already in use by another account: " + normalizedEmail);
            }
            hr.setEmail(normalizedEmail);
        }

        hr.setFullName(request.getFullName().trim());
        if (request.getDesignation() != null) {
            hr.setDesignation(request.getDesignation().trim());
        }
        if (request.getPhoneNumber() != null) {
            hr.setPhoneNumber(request.getPhoneNumber().trim());
        }
        if (request.getEmployeeId() != null) {
            hr.setEmployeeId(request.getEmployeeId().trim());
        }
        if (request.getActive() != null) {
            hr.setActive(request.getActive());
        }

        User updated = userRepository.save(hr);

        // Synchronize into dedicated hrs table
        Hr hrProfile = hrRepository.findByUserId(updated.getId());
        if (hrProfile == null) {
            hrProfile = hrRepository.findByEmailIgnoreCase(updated.getEmail());
        }
        if (hrProfile != null) {
            hrProfile.setName(updated.getFullName());
            hrProfile.setEmail(updated.getEmail());
            hrProfile.setPhone(updated.getPhoneNumber());
            hrProfile.setDesignation(updated.getDesignation());
            hrProfile.setHrCode(updated.getEmployeeId());
            if (updated.getActive() != null) {
                hrProfile.setActive(updated.getActive());
            }
            hrRepository.save(hrProfile);
        }

        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.AUTH,
                updated.getId().toString(),
                "Company Admin updated HR: " + updated.getFullName() + " (" + updated.getEmail() + ")",
                admin
        );

        return toHrDTO(updated);
    }

    /**
     * Toggle HR active/suspended status.
     */
    @Transactional
    public HrDTO toggleHrStatus(Long hrId, boolean active, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail);
        Company company = getAdminCompany(adminEmail);

        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found with id: " + hrId));

        validateHrBelongsToCompany(hr, company);
        hr.setActive(active);
        User updated = userRepository.save(hr);

        // Synchronize status into hrs table
        Hr hrProfile = hrRepository.findByUserId(updated.getId());
        if (hrProfile != null) {
            hrProfile.setActive(active);
            hrRepository.save(hrProfile);
        }

        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.AUTH,
                updated.getId().toString(),
                "Company Admin " + (active ? "activated" : "deactivated") + " HR account: " + updated.getEmail(),
                admin
        );

        return toHrDTO(updated);
    }

    /**
     * Resend/reset credentials for an HR with temporary password.
     */
    @Transactional
    public HrDTO resetHrPassword(Long hrId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail);
        Company company = getAdminCompany(adminEmail);

        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found with id: " + hrId));

        validateHrBelongsToCompany(hr, company);

        String tempPassword = generateSecureTempPassword();
        hr.setPassword(tempPassword);
        hr.setPasswordChangeRequired(true);
        User updated = userRepository.save(hr);

        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.AUTH,
                updated.getId().toString(),
                "Company Admin reset password for HR: " + updated.getEmail(),
                admin
        );

        try {
            emailService.sendHrPasswordResetEmail(updated, tempPassword);
        } catch (Exception ignored) {
        }

        return toHrDTO(updated);
    }

    /**
     * Delete an HR account from the company.
     */
    @Transactional
    public void deleteHr(Long hrId, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail);
        Company company = getAdminCompany(adminEmail);

        User hr = userRepository.findById(hrId)
                .orElseThrow(() -> new ResourceNotFoundException("HR user not found with id: " + hrId));

        validateHrBelongsToCompany(hr, company);

        // Delete from dedicated hrs table first
        try {
            hrRepository.deleteByUserId(hr.getId());
        } catch (Exception ignored) {
        }

        userRepository.delete(hr);

        auditLogService.log(
                AuditAction.DELETE,
                AuditModule.AUTH,
                hrId.toString(),
                "Company Admin deleted HR: " + hr.getFullName() + " (" + hr.getEmail() + ")",
                admin
        );
    }

    /**
     * Update own company's profile information.
     */
    @Transactional
    public Company updateCompanyProfile(UpdateCompanyProfileRequest request, String adminEmail) {
        User admin = userRepository.findByEmail(adminEmail);
        Company company = getAdminCompany(adminEmail);

        if (request.getPhone() != null) company.setPhone(request.getPhone().trim());
        if (request.getAddress() != null) company.setAddress(request.getAddress().trim());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite().trim());
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry().trim());
        if (request.getCity() != null) company.setCity(request.getCity().trim());
        if (request.getState() != null) company.setState(request.getState().trim());
        if (request.getPostalCode() != null) company.setPostalCode(request.getPostalCode().trim());
        if (request.getCountry() != null) company.setCountry(request.getCountry().trim());

        Company saved = companyRepository.save(company);

        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.COMPANY,
                saved.getId().toString(),
                "Company Admin updated company profile: " + saved.getName(),
                admin
        );

        return saved;
    }

    private void validateHrBelongsToCompany(User hr, Company company) {
        if (!"HR".equalsIgnoreCase(hr.getRole())) {
            throw new IllegalArgumentException("Requested user is not an HR account.");
        }
        if (hr.getCompany() == null || !Objects.equals(hr.getCompany().getId(), company.getId())) {
            throw new SecurityException("Unauthorized: HR does not belong to your company.");
        }
    }

    private String generateSecureTempPassword() {
        StringBuilder sb = new StringBuilder(10);
        for (int i = 0; i < 10; i++) {
            sb.append(TEMP_PASSWORD_CHARS.charAt(RANDOM.nextInt(TEMP_PASSWORD_CHARS.length())));
        }
        return sb.toString();
    }

    public HrDTO toHrDTO(User user) {
        if (user == null) return null;
        return new HrDTO(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getActive(),
                user.getCompany() != null ? user.getCompany().getId() : null,
                user.getCompany() != null ? user.getCompany().getName() : null,
                user.getDesignation(),
                user.getPhoneNumber(),
                user.getEmployeeId(),
                user.getCreatedAt(),
                user.getLastLoginAt(),
                user.getPasswordChangeRequired()
        );
    }
}
