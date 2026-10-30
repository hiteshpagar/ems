package com.ems.config;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.ems.entity.Admin;
import com.ems.entity.Employee;
import com.ems.entity.Hr;
import com.ems.entity.SuperAdmin;
import com.ems.entity.User;
import com.ems.repository.AdminRepository;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.HrRepository;
import com.ems.repository.SuperAdminRepository;
import com.ems.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SuperAdminRepository superAdminRepository;

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private HrRepository hrRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

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
            User masterUser = userRepository.findByEmail(normalizedEmail);

            if (masterUser == null) {
                masterUser = new User();
                masterUser.setFullName(superAdminFullName.trim());
                masterUser.setEmail(normalizedEmail);
                masterUser.setPassword(superAdminPassword);
                masterUser.setPhoneNumber(superAdminPhone.trim());
                masterUser.setRole("SUPER_ADMIN");
                masterUser.setActive(true);
                masterUser.setDesignation("Super Administrator");
                masterUser.setCreatedAt(LocalDateTime.now());
                masterUser.setLastLoginAt(LocalDateTime.now());
                masterUser = userRepository.save(masterUser);
                log.info("System Owner / Super Admin account initialized successfully for: {}", normalizedEmail);
            } else {
                masterUser.setFullName(superAdminFullName.trim());
                masterUser.setPassword(superAdminPassword);
                masterUser.setPhoneNumber(superAdminPhone.trim());
                masterUser.setRole("SUPER_ADMIN");
                masterUser.setActive(true);
                masterUser.setDesignation("Super Administrator");
                masterUser = userRepository.save(masterUser);
                log.info("System Owner / Super Admin account verified and active for: {}", normalizedEmail);
            }

            // Sync master SuperAdmin entity in dedicated super_admins table
            SuperAdmin superAdminEntity = superAdminRepository.findByUserId(masterUser.getId());
            if (superAdminEntity == null) {
                superAdminEntity = superAdminRepository.findByEmailIgnoreCase(normalizedEmail);
            }
            if (superAdminEntity == null) {
                superAdminEntity = new SuperAdmin();
            }
            superAdminEntity.setUser(masterUser);
            superAdminEntity.setName(masterUser.getFullName());
            superAdminEntity.setEmail(masterUser.getEmail());
            superAdminEntity.setPhone(masterUser.getPhoneNumber());
            superAdminEntity.setDesignation("Super Administrator");
            superAdminRepository.save(superAdminEntity);
            log.info("SuperAdmin profile synchronized into super_admins table.");

            // Auto-migrate & sync existing ADMIN users into dedicated admins table
            List<User> adminUsers = userRepository.findByRole("ADMIN");
            for (User adminUser : adminUsers) {
                if (adminUser.getCompany() != null) {
                    Admin admin = adminRepository.findByUserId(adminUser.getId());
                    if (admin == null) {
                        admin = adminRepository.findByEmailIgnoreCase(adminUser.getEmail());
                    }
                    if (admin == null) {
                        admin = new Admin();
                    }
                    admin.setUser(adminUser);
                    admin.setCompany(adminUser.getCompany());
                    admin.setName(adminUser.getFullName());
                    admin.setEmail(adminUser.getEmail());
                    admin.setPhone(adminUser.getPhoneNumber());
                    admin.setDesignation(adminUser.getDesignation() != null ? adminUser.getDesignation() : "Company Owner");
                    admin.setAdminCode(adminUser.getEmployeeId());
                    admin.setActive(adminUser.getActive() != null ? adminUser.getActive() : true);
                    adminRepository.save(admin);
                }
            }
            log.info("Admin profiles synchronized into admins table (Total: {}).", adminUsers.size());

            // Auto-migrate & sync existing HR users into dedicated hrs table
            List<User> hrUsers = userRepository.findByRole("HR");
            for (User hrUser : hrUsers) {
                if (hrUser.getCompany() != null) {
                    Hr hr = hrRepository.findByUserId(hrUser.getId());
                    if (hr == null) {
                        hr = hrRepository.findByEmailIgnoreCase(hrUser.getEmail());
                    }
                    if (hr == null) {
                        hr = new Hr();
                    }
                    hr.setUser(hrUser);
                    hr.setCompany(hrUser.getCompany());
                    hr.setName(hrUser.getFullName());
                    hr.setEmail(hrUser.getEmail());
                    hr.setPhone(hrUser.getPhoneNumber());
                    hr.setDepartment("Human Resources");
                    hr.setDesignation(hrUser.getDesignation() != null ? hrUser.getDesignation() : "HR Manager");
                    hr.setHrCode(hrUser.getEmployeeId());
                    hr.setActive(hrUser.getActive() != null ? hrUser.getActive() : true);
                    hrRepository.save(hr);
                }
            }
            log.info("HR profiles synchronized into hrs table (Total: {}).", hrUsers.size());

            // Purge any stray legacy HR/Admin/SuperAdmin records accidentally inserted into employees table
            List<Employee> allEmployees = employeeRepository.findAll();
            for (Employee emp : allEmployees) {
                if (emp.getEmail() != null) {
                    String empEmail = emp.getEmail().trim().toLowerCase(Locale.ROOT);
                    User u = userRepository.findByEmailIgnoreCase(empEmail);
                    if (u != null && ("ADMIN".equalsIgnoreCase(u.getRole()) || "HR".equalsIgnoreCase(u.getRole()) || "SUPER_ADMIN".equalsIgnoreCase(u.getRole()))) {
                        log.info("Purging legacy non-employee record from employees table: {} ({})", emp.getName(), emp.getEmail());
                        try {
                            employeeRepository.deleteById(emp.getId());
                        } catch (Exception ex) {
                            log.warn("Could not delete legacy employee entry {}: {}", emp.getId(), ex.getMessage());
                        }
                    }
                }
            }

        } catch (Exception e) {
            log.error("Failed to seed Super Admin or sync entity tables: {}", e.getMessage(), e);
        }
    }
}
