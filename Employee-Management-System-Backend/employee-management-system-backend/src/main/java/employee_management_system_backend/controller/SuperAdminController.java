package employee_management_system_backend.controller;

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

import employee_management_system_backend.dto.AdminDTO;
import employee_management_system_backend.dto.CreateAdminRequest;
import employee_management_system_backend.dto.ResetAdminPasswordRequest;
import employee_management_system_backend.dto.SuperAdminStatsDTO;
import employee_management_system_backend.dto.UpdateAdminRequest;
import employee_management_system_backend.service.SuperAdminService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/super-admin")
@CrossOrigin("*")
public class SuperAdminController {

    @Autowired
    private SuperAdminService superAdminService;

    @GetMapping("/stats")
    public ResponseEntity<SuperAdminStatsDTO> getStats() {
        return ResponseEntity.ok(superAdminService.getSuperAdminStats());
    }

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
}
