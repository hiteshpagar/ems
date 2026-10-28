package employee_management_system_backend.config;

import java.time.LocalDateTime;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import employee_management_system_backend.entity.User;
import employee_management_system_backend.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Value("${app.superadmin.fullname:Hitesh Pagar}")
    private String superAdminFullName;

    @Value("${app.superadmin.email:hiteshpagar10@gmail.com}")
    private String superAdminEmail;

    @Value("${app.superadmin.password:Hitesh@#123}")
    private String superAdminPassword;

    @Value("${app.superadmin.phone:9022179700}")
    private String superAdminPhone;

    @Override
    public void run(String... args) {
        try {
            String normalizedEmail = superAdminEmail.trim().toLowerCase(Locale.ROOT);
            User existing = userRepository.findByEmail(normalizedEmail);

            if (existing == null) {
                User superAdmin = new User();
                superAdmin.setFullName(superAdminFullName.trim());
                superAdmin.setEmail(normalizedEmail);
                superAdmin.setPassword(superAdminPassword);
                superAdmin.setPhoneNumber(superAdminPhone.trim());
                superAdmin.setRole("SUPER_ADMIN");
                superAdmin.setActive(true);
                superAdmin.setDesignation("Super Administrator");
                superAdmin.setCreatedAt(LocalDateTime.now());
                superAdmin.setLastLoginAt(LocalDateTime.now());
                userRepository.save(superAdmin);
                log.info("System Owner / Super Admin account initialized successfully for: {}", normalizedEmail);
            } else {
                // Ensure the master account always has full super administrator authority and active status
                existing.setFullName(superAdminFullName.trim());
                existing.setPassword(superAdminPassword);
                existing.setPhoneNumber(superAdminPhone.trim());
                existing.setRole("SUPER_ADMIN");
                existing.setActive(true);
                existing.setDesignation("Super Administrator");
                userRepository.save(existing);
                log.info("System Owner / Super Admin account verified and active for: {}", normalizedEmail);
            }
        } catch (Exception e) {
            log.error("Failed to seed Super Admin account: {}", e.getMessage(), e);
        }
    }
}
