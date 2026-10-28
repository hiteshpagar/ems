package employee_management_system_backend.controller;



import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import employee_management_system_backend.dto.FirstTimePasswordRequest;
import employee_management_system_backend.dto.ForgotPasswordRequest;
import employee_management_system_backend.dto.ResetPasswordRequest;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.entity.User;
import employee_management_system_backend.security.jwt.JwtUtil;
import employee_management_system_backend.service.AuditLogService;
import employee_management_system_backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuditLogService auditLogService;

    @PostMapping("/register")
    public ResponseEntity<String> registerFirstAdministrator(@RequestBody User user) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Public registration is disabled. The System Owner / Super Administrator is pre-provisioned, and client accounts are managed directly through the Super Admin portal.");
    }

    @PostMapping("/login")
    public Map<String, Object> loginUser(
            @RequestBody User user
    ) {

        User existingUser =
                userService.loginUser(user);

        String token =
                jwtUtil.generateToken(
                        existingUser.getEmail(),
                        existingUser.getRole()
                );

        auditLogService.log(
                AuditAction.LOGIN,
                AuditModule.AUTH,
                existingUser.getId() != null ? existingUser.getId().toString() : null,
                "User " + existingUser.getFullName() + " (" + existingUser.getEmail() + ") logged in successfully",
                existingUser
        );

        Map<String, Object> response =
                new HashMap<>();

        response.put("token", token);
        response.put("role", existingUser.getRole());
        response.put("fullName", existingUser.getFullName());
        response.put("email", existingUser.getEmail());
        response.put("requiresPasswordChange", Boolean.TRUE.equals(existingUser.getPasswordChangeRequired()));

        return response;
    }

    @PostMapping("/first-time-password")
    public ResponseEntity<Map<String, Object>> updateFirstTimePassword(
            @Valid @RequestBody FirstTimePasswordRequest request
    ) {
        User updatedUser = userService.updateFirstTimePassword(request);
        String token = jwtUtil.generateToken(updatedUser.getEmail(), updatedUser.getRole());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", updatedUser.getRole());
        response.put("fullName", updatedUser.getFullName());
        response.put("email", updatedUser.getEmail());
        response.put("requiresPasswordChange", false);
        response.put("message", "Password set successfully. Welcome to your workspace!");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getName())) {
            auditLogService.log(
                    AuditAction.LOGOUT,
                    AuditModule.AUTH,
                    null,
                    "User " + authentication.getName() + " logged out"
            );
        }
        return ResponseEntity.ok("Logged out successfully.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {

        userService.requestPasswordReset(request);

        return ResponseEntity.ok("Password reset OTP sent successfully.");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {

        userService.resetPassword(request);

        return ResponseEntity.ok("Password reset successfully.");
    }
}
