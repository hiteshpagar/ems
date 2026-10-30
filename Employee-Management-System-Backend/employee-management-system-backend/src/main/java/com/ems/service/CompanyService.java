package com.ems.service;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ems.dto.CompanyDTO;
import com.ems.dto.CreateCompanyRequest;
import com.ems.entity.AuditAction;
import com.ems.entity.AuditModule;
import com.ems.entity.Company;
import com.ems.entity.User;
import com.ems.exception.ResourceAlreadyExistsException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.CompanyRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.UserRepository;

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
            if (!code.matches("^[A-Z0-9_-]{2,15}$")) {
                throw new IllegalArgumentException("Company code must be 2 to 15 alphanumeric characters without spaces.");
            }
            if (companyRepository.existsByCodeIgnoreCase(code)) {
                throw new ResourceAlreadyExistsException("Company code already in use: " + code);
            }
            company.setCode(code);
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
            if (!email.matches("^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
                throw new IllegalArgumentException("Invalid company email format: " + email);
            }
            company.setEmail(email);
        } else {
            company.setEmail(null);
        }
        company.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        company.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        company.setRegistrationNumber(request.getRegistrationNumber() != null ? request.getRegistrationNumber().trim() : null);
        company.setIndustry(request.getIndustry() != null ? request.getIndustry().trim() : null);
        company.setWebsite(request.getWebsite() != null ? request.getWebsite().trim() : null);
        company.setCity(request.getCity() != null ? request.getCity().trim() : null);
        company.setState(request.getState() != null ? request.getState().trim() : null);
        company.setPostalCode(request.getPostalCode() != null ? request.getPostalCode().trim() : null);
        company.setCountry(request.getCountry() != null ? request.getCountry().trim() : "India");

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
            if (!code.matches("^[A-Z0-9_-]{2,15}$")) {
                throw new IllegalArgumentException("Company code must be 2 to 15 alphanumeric characters without spaces.");
            }
            if (companyRepository.existsByCodeIgnoreCaseAndIdNot(code, id)) {
                throw new ResourceAlreadyExistsException("Another company with this code already exists: " + code);
            }
            company.setCode(code);
        } else {
            company.setCode(null);
        }

        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            String email = request.getEmail().trim().toLowerCase(Locale.ROOT);
            if (!email.matches("^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$")) {
                throw new IllegalArgumentException("Invalid company email format: " + email);
            }
            company.setEmail(email);
        } else {
            company.setEmail(null);
        }
        company.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        company.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        company.setRegistrationNumber(request.getRegistrationNumber() != null ? request.getRegistrationNumber().trim() : null);
        company.setIndustry(request.getIndustry() != null ? request.getIndustry().trim() : null);
        company.setWebsite(request.getWebsite() != null ? request.getWebsite().trim() : null);
        company.setCity(request.getCity() != null ? request.getCity().trim() : null);
        company.setState(request.getState() != null ? request.getState().trim() : null);
        company.setPostalCode(request.getPostalCode() != null ? request.getPostalCode().trim() : null);
        company.setCountry(request.getCountry() != null ? request.getCountry().trim() : "India");

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
        CompanyDTO dto = new CompanyDTO(
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
        dto.setRegistrationNumber(company.getRegistrationNumber());
        dto.setIndustry(company.getIndustry());
        dto.setWebsite(company.getWebsite());
        dto.setCity(company.getCity());
        dto.setState(company.getState());
        dto.setPostalCode(company.getPostalCode());
        dto.setCountry(company.getCountry());
        return dto;
    }
}
