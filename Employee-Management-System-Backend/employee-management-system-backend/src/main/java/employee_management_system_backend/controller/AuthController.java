package employee_management_system_backend.controller;



import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import employee_management_system_backend.dto.ForgotPasswordRequest;
import employee_management_system_backend.dto.ResetPasswordRequest;
import employee_management_system_backend.entity.User;
import employee_management_system_backend.security.jwt.JwtUtil;
import employee_management_system_backend.service.UserService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;
    
    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/login")
    public Map<String, String> loginUser(
            @RequestBody User user
    ) {

        User existingUser =
                userService.loginUser(user);

        String token =
                jwtUtil.generateToken(
                        existingUser.getEmail(),
                        existingUser.getRole()
                );

        Map<String, String> response =
                new HashMap<>();

        response.put("token", token);

        response.put(
                "role",
                existingUser.getRole()
        );

        response.put(
                "fullName",
                existingUser.getFullName()
        );

        return response;
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
