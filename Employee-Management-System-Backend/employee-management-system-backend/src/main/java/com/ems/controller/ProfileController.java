package com.ems.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ems.entity.Employee;
import com.ems.service.EmployeeService;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private com.ems.repository.UserRepository userRepository;

    @GetMapping
    public Employee getProfile(
            Authentication authentication
    ) {

        Employee emp = employeeService.getEmployeeByEmail(
                authentication.getName()
        );

        if (emp != null) {
            return emp;
        }

        // Fallback for Super Admin or Admin accounts that exist in users table
        com.ems.entity.User user = userRepository.findByEmail(authentication.getName());
        if (user != null) {
            Employee dummy = new Employee();
            dummy.setId(user.getId());
            dummy.setName(user.getFullName());
            String defaultDept = "SUPER_ADMIN".equalsIgnoreCase(user.getRole())
                    ? "Executive Board"
                    : "HR".equalsIgnoreCase(user.getRole())
                    ? "Human Resources"
                    : (user.getCompany() != null ? user.getCompany().getName() : "Management");
            dummy.setDepartment(defaultDept);

            String defaultDesig = "SUPER_ADMIN".equalsIgnoreCase(user.getRole())
                    ? "Super Administrator"
                    : "HR".equalsIgnoreCase(user.getRole())
                    ? "HR Manager"
                    : "Administrator";
            dummy.setDesignation(user.getDesignation() != null && !user.getDesignation().isBlank()
                    ? user.getDesignation()
                    : defaultDesig);
            dummy.setCompany(user.getCompany());
            dummy.setPhone(user.getPhoneNumber());
            dummy.setEmployeeId(user.getEmployeeId());
            dummy.setLastLoginAt(user.getLastLoginAt() != null ? user.getLastLoginAt() : java.time.LocalDateTime.now());
            dummy.setCreatedAt(user.getCreatedAt());
            return dummy;
        }

        return null;
    }
    
    @PutMapping
    public Employee updateProfile(
            @RequestBody Employee employee,
            Authentication authentication
    ) {

        return employeeService.updateMyProfile(
                authentication.getName(),
                employee
        );
    }
}