package employee_management_system_backend.service;


import java.security.SecureRandom;
import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.dto.ForgotPasswordRequest;
import employee_management_system_backend.dto.ResetPasswordRequest;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.entity.User;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.repository.UserRepository;
import employee_management_system_backend.entity.NotificationType;

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
