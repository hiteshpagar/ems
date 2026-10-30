package com.ems.controller;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ems.dto.AdminCompanyOverviewDTO;
import com.ems.dto.CreateHrRequest;
import com.ems.dto.HrDTO;
import com.ems.dto.UpdateCompanyProfileRequest;
import com.ems.dto.UpdateHrRequest;
import com.ems.entity.Company;
import com.ems.service.AdminService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/overview")
    public ResponseEntity<AdminCompanyOverviewDTO> getCompanyOverview(Principal principal) {
        return ResponseEntity.ok(adminService.getCompanyOverview(principal.getName()));
    }

    @GetMapping("/company")
    public ResponseEntity<Company> getCompanyProfile(Principal principal) {
        return ResponseEntity.ok(adminService.getAdminCompany(principal.getName()));
    }

    @PutMapping("/company")
    public ResponseEntity<Company> updateCompanyProfile(
            @RequestBody UpdateCompanyProfileRequest request,
            Principal principal) {
        return ResponseEntity.ok(adminService.updateCompanyProfile(request, principal.getName()));
    }

    @GetMapping("/hrs")
    public ResponseEntity<List<HrDTO>> getCompanyHrs(Principal principal) {
        return ResponseEntity.ok(adminService.getCompanyHrs(principal.getName()));
    }

    @GetMapping("/hrs/{id}")
    public ResponseEntity<HrDTO> getHrById(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(adminService.getCompanyHrById(id, principal.getName()));
    }

    @PostMapping("/hrs")
    public ResponseEntity<HrDTO> createHr(
            @Valid @RequestBody CreateHrRequest request,
            Principal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(adminService.createHr(request, principal.getName()));
    }

    @PutMapping("/hrs/{id}")
    public ResponseEntity<HrDTO> updateHr(
            @PathVariable Long id,
            @Valid @RequestBody UpdateHrRequest request,
            Principal principal) {
        return ResponseEntity.ok(adminService.updateHr(id, request, principal.getName()));
    }

    @PatchMapping("/hrs/{id}/status")
    public ResponseEntity<HrDTO> toggleHrStatus(
            @PathVariable Long id,
            @RequestParam boolean active,
            Principal principal) {
        return ResponseEntity.ok(adminService.toggleHrStatus(id, active, principal.getName()));
    }

    @PostMapping("/hrs/{id}/reset-password")
    public ResponseEntity<HrDTO> resetHrPassword(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(adminService.resetHrPassword(id, principal.getName()));
    }

    @DeleteMapping("/hrs/{id}")
    public ResponseEntity<Map<String, String>> deleteHr(
            @PathVariable Long id,
            Principal principal) {
        adminService.deleteHr(id, principal.getName());
        return ResponseEntity.ok(Map.of("message", "HR account removed successfully"));
    }
}
