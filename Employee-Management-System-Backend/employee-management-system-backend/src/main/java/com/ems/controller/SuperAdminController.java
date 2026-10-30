package com.ems.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ems.dto.AdminDTO;
import com.ems.dto.CompanyDTO;
import com.ems.dto.CreateAdminRequest;
import com.ems.dto.CreateCompanyRequest;
import com.ems.dto.ResetAdminPasswordRequest;
import com.ems.dto.SuperAdminStatsDTO;
import com.ems.dto.UpdateAdminRequest;
import com.ems.service.CompanyService;
import com.ems.service.SuperAdminService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/super-admin")
@CrossOrigin("*")
public class SuperAdminController {

    @Autowired
    private SuperAdminService superAdminService;

    @Autowired
    private CompanyService companyService;

    @GetMapping("/stats")
    public ResponseEntity<SuperAdminStatsDTO> getStats() {
        return ResponseEntity.ok(superAdminService.getSuperAdminStats());
    }

    // --- Administrator Management ---

    @GetMapping("/admins")
    public ResponseEntity<List<AdminDTO>> getAllAdmins() {
        return ResponseEntity.ok(superAdminService.getAllAdmins());
    }

    @PostMapping("/admins")
    public ResponseEntity<AdminDTO> createAdmin(
            @Valid @RequestBody CreateAdminRequest request,
            Authentication authentication
    ) {
        String superAdminEmail = authentication != null ? authentication.getName() : null;
        AdminDTO created = superAdminService.createAdmin(request, superAdminEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/admins/{id}")
    public ResponseEntity<AdminDTO> updateAdmin(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminRequest request,
            Authentication authentication
    ) {
        String superAdminEmail = authentication != null ? authentication.getName() : null;
        AdminDTO updated = superAdminService.updateAdmin(id, request, superAdminEmail);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/admins/{id}")
    public ResponseEntity<Void> deleteAdmin(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String superAdminEmail = authentication != null ? authentication.getName() : null;
        superAdminService.deleteAdmin(id, superAdminEmail);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/admins/{id}/reset-password")
    public ResponseEntity<String> resetAdminPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetAdminPasswordRequest request,
            Authentication authentication
    ) {
        String superAdminEmail = authentication != null ? authentication.getName() : null;
        superAdminService.resetAdminPassword(id, request, superAdminEmail);
        return ResponseEntity.ok("Administrator password reset successfully.");
    }

    @PutMapping("/admins/{id}/toggle-status")
    public ResponseEntity<AdminDTO> toggleAdminStatus(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String superAdminEmail = authentication != null ? authentication.getName() : null;
        AdminDTO updated = superAdminService.toggleAdminStatus(id, superAdminEmail);
        return ResponseEntity.ok(updated);
    }

    // --- Company Management ---

    @GetMapping("/companies")
    public ResponseEntity<List<CompanyDTO>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<CompanyDTO> getCompanyById(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompanyById(id));
    }

    @GetMapping("/companies/{companyId}/admins")
    public ResponseEntity<List<AdminDTO>> getAdminsByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(superAdminService.getAdminsByCompany(companyId));
    }

    @PostMapping("/companies")
    public ResponseEntity<CompanyDTO> createCompany(
            @Valid @RequestBody CreateCompanyRequest request,
            Authentication authentication
    ) {
        String superAdminEmail = authentication != null ? authentication.getName() : null;
        CompanyDTO created = companyService.createCompany(request, superAdminEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<CompanyDTO> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CreateCompanyRequest request,
            Authentication authentication
    ) {
        String superAdminEmail = authentication != null ? authentication.getName() : null;
        CompanyDTO updated = companyService.updateCompany(id, request, superAdminEmail);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(
            @PathVariable Long id,
            Authentication authentication
    ) {
        String superAdminEmail = authentication != null ? authentication.getName() : null;
        companyService.deleteCompany(id, superAdminEmail);
        return ResponseEntity.noContent().build();
    }
}
