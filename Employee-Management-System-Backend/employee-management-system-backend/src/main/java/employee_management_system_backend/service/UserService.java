package employee_management_system_backend.service;


import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import employee_management_system_backend.dto.ForgotPasswordRequest;
import employee_management_system_backend.dto.ResetPasswordRequest;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.entity.User;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.exception.ResourceAlreadyExistsException;
import employee_management_system_backend.repository.UserRepository;
import employee_management_system_backend.entity.NotificationType;
import jakarta.annotation.PostConstruct;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    @Value("${app.password-reset.otp-expiry-minutes:10}")
    private int otpExpiryMinutes;

    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    public void ensureSuperAdminsActive() {
        try {
            for (User u : userRepository.findAll()) {
                if ("SUPER_ADMIN".equalsIgnoreCase(u.getRole()) && !Boolean.TRUE.equals(u.getActive())) {
                    u.setActive(true);
                    userRepository.save(u);
                }
            }
        } catch (Exception ignored) {
        }
    }

    /** Creates the first account as super administrator and closes public registration afterward. */
    @Transactional
    public synchronized User registerFirstAdministrator(String fullName, String email, String password) {
        return registerFirstAdministrator(fullName, email, password, null);
    }

    @Transactional
    public synchronized User registerFirstAdministrator(String fullName, String email, String password, String phoneNumber) {
        String normalizedName = fullName == null ? "" : fullName.trim();
        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);

        if (normalizedName.isEmpty() || normalizedEmail.isEmpty() || password == null || password.isBlank()) {
            throw new IllegalArgumentException("Full name, email, and password are required.");
        }
        if (userRepository.count() > 0) {
            throw new ResourceAlreadyExistsException("Registration is closed because an account already exists.");
        }

        User user = new User();
        user.setFullName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setPassword(password);
        user.setRole("SUPER_ADMIN");
        user.setActive(true);
        user.setDesignation("Super Administrator");
        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            user.setPhoneNumber(phoneNumber.trim());
        }
        return userRepository.save(user);
    }

    public User login(
            String email,
            String password
    ) {

        User user =
                userRepository.findByEmail(email);

        if(user != null &&
           user.getPassword().equals(password)) {

            return user;
        }

        return null;
    }
    
    public User loginUser(
            User user
    ) {

        User existingUser =
                userRepository.findByEmail(
                        user.getEmail()
                );

        if (
            existingUser != null
            &&
            existingUser.getPassword()
                .equals(user.getPassword())
        ) {
            // Auto-promote first admin to SUPER_ADMIN if no SUPER_ADMIN exists yet
            if ("ADMIN".equalsIgnoreCase(existingUser.getRole()) && userRepository.findByRole("SUPER_ADMIN").isEmpty()) {
                existingUser.setRole("SUPER_ADMIN");
                existingUser.setActive(true);
                existingUser = userRepository.save(existingUser);
            }

            // Super Admin can NEVER be deactivated
            if ("SUPER_ADMIN".equalsIgnoreCase(existingUser.getRole())) {
                if (!Boolean.TRUE.equals(existingUser.getActive())) {
                    existingUser.setActive(true);
                    existingUser = userRepository.save(existingUser);
                }
            } else if (Boolean.FALSE.equals(existingUser.getActive())) {
                throw new RuntimeException("Account is deactivated. Please contact Super Administrator.");
            }

            existingUser.setLastLoginAt(LocalDateTime.now());
            existingUser = userRepository.save(existingUser);
            return existingUser;
        }

        throw new RuntimeException(
                "Invalid Email or Password"
        );
    }

    public void requestPasswordReset(ForgotPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail());

        if (user == null) {
            throw new ResourceNotFoundException("User not found.");
        }

        String otp = String.valueOf(100000 + secureRandom.nextInt(900000));

        user.setResetOtp(otp);
        user.setResetOtpExpiresAt(
                LocalDateTime.now().plusMinutes(otpExpiryMinutes));

        userRepository.save(user);

        emailService.sendPasswordResetOtp(
                user.getEmail(),
                otp,
                otpExpiryMinutes);
        notificationService.createForUser(user, "Password reset requested",
                "A password reset OTP was requested for your account.", NotificationType.PASSWORD);
    }

    public void resetPassword(ResetPasswordRequest request) {

        User user = userRepository.findByEmail(request.getEmail());

        if (user == null) {
            throw new ResourceNotFoundException("User not found.");
        }

        if (user.getResetOtp() == null
                || user.getResetOtpExpiresAt() == null
                || !user.getResetOtp().equals(request.getOtp())
                || user.getResetOtpExpiresAt().isBefore(LocalDateTime.now())) {

            throw new RuntimeException("Invalid or expired OTP.");
        }

        user.setPassword(request.getNewPassword());
        user.setResetOtp(null);
        user.setResetOtpExpiresAt(null);

        userRepository.save(user);

        emailService.sendPasswordResetConfirmation(user.getEmail());
        notificationService.createForUser(user, "Password reset completed",
                "Your account password was reset successfully.", NotificationType.PASSWORD);

        auditLogService.log(
                AuditAction.PASSWORD_RESET,
                AuditModule.AUTH,
                user.getId() != null ? user.getId().toString() : null,
                "Password reset completed for user " + user.getEmail(),
                user
        );
    }
}
