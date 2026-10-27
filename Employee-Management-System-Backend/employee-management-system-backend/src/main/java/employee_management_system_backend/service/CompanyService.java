package employee_management_system_backend.service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import employee_management_system_backend.dto.CompanyDTO;
import employee_management_system_backend.dto.CreateCompanyRequest;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.entity.Company;
import employee_management_system_backend.entity.User;
import employee_management_system_backend.exception.ResourceAlreadyExistsException;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.repository.CompanyRepository;
import employee_management_system_backend.repository.EmployeeRepository;
import employee_management_system_backend.repository.UserRepository;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogService auditLogService;

    public List<CompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CompanyDTO getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
        return toDto(company);
    }

    public Company getCompanyEntity(Long id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));
    }

    public Company getOrCreateCompanyByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return null;
        }
        String trimmedName = name.trim();
        return companyRepository.findByNameIgnoreCase(trimmedName)
                .orElseGet(() -> {
                    Company newCompany = new Company();
                    newCompany.setName(trimmedName);
                    String autoCode = trimmedName.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
                    if (autoCode.length() > 6) {
                        autoCode = autoCode.substring(0, 6);
                    }
                    if (!autoCode.isEmpty() && !companyRepository.existsByCodeIgnoreCase(autoCode)) {
                        newCompany.setCode(autoCode);
                    }
                    return companyRepository.save(newCompany);
                });
    }

    @Transactional
    public CompanyDTO createCompany(CreateCompanyRequest request, String superAdminEmail) {
        String trimmedName = request.getName().trim();
        if (companyRepository.existsByNameIgnoreCase(trimmedName)) {
            throw new ResourceAlreadyExistsException("A company with this name already exists: " + trimmedName);
        }

        Company company = new Company();
        company.setName(trimmedName);

        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            String code = request.getCode().trim().toUpperCase(Locale.ROOT);
            if (companyRepository.existsByCodeIgnoreCase(code)) {
                throw new ResourceAlreadyExistsException("Company code already in use: " + code);
            }
            company.setCode(code);
        }

        company.setEmail(request.getEmail() != null ? request.getEmail().trim().toLowerCase(Locale.ROOT) : null);
        company.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        company.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);

        Company saved = companyRepository.save(company);

        User superAdmin = superAdminEmail != null ? userRepository.findByEmail(superAdminEmail) : null;
        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.AUTH,
                saved.getId().toString(),
                "Super Admin created new Company: " + saved.getName(),
                superAdmin
        );

        return toDto(saved);
    }

    @Transactional
    public CompanyDTO updateCompany(Long id, CreateCompanyRequest request, String superAdminEmail) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        String trimmedName = request.getName().trim();
        if (companyRepository.existsByNameIgnoreCaseAndIdNot(trimmedName, id)) {
            throw new ResourceAlreadyExistsException("Another company with this name already exists: " + trimmedName);
        }

        company.setName(trimmedName);

        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            String code = request.getCode().trim().toUpperCase(Locale.ROOT);
            company.setCode(code);
        } else {
            company.setCode(null);
        }

        company.setEmail(request.getEmail() != null ? request.getEmail().trim().toLowerCase(Locale.ROOT) : null);
        company.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        company.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);

        Company saved = companyRepository.save(company);

        User superAdmin = superAdminEmail != null ? userRepository.findByEmail(superAdminEmail) : null;
        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.AUTH,
                saved.getId().toString(),
                "Super Admin updated Company: " + saved.getName(),
                superAdmin
        );

        return toDto(saved);
    }

    @Transactional
    public void deleteCompany(Long id, String superAdminEmail) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        long adminCount = userRepository.countByCompanyIdAndRole(id, "ADMIN");
        long employeeCount = employeeRepository.countByCompanyId(id);

        if (adminCount > 0 || employeeCount > 0) {
            throw new IllegalArgumentException("Cannot delete company with active administrators or employees. Reassign or remove them first.");
        }

        companyRepository.delete(company);

        User superAdmin = superAdminEmail != null ? userRepository.findByEmail(superAdminEmail) : null;
        auditLogService.log(
                AuditAction.DELETE,
                AuditModule.AUTH,
                id.toString(),
                "Super Admin deleted Company: " + company.getName(),
                superAdmin
        );
    }

    public CompanyDTO toDto(Company company) {
        long totalAdmins = userRepository.countByCompanyIdAndRole(company.getId(), "ADMIN");
        long totalEmployees = employeeRepository.countByCompanyId(company.getId());
        return new CompanyDTO(
                company.getId(),
                company.getName(),
                company.getCode(),
                company.getEmail(),
                company.getPhone(),
                company.getAddress(),
                totalAdmins,
                totalEmployees,
                company.getCreatedAt()
        );
    }
}
