package employee_management_system_backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.service.EmployeeService;

import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private employee_management_system_backend.repository.UserRepository userRepository;

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
        employee_management_system_backend.entity.User user = userRepository.findByEmail(authentication.getName());
        if (user != null) {
            Employee dummy = new Employee();
            dummy.setId(user.getId());
            dummy.setName(user.getFullName());
            dummy.setEmail(user.getEmail());
            dummy.setDepartment("SUPER_ADMIN".equalsIgnoreCase(user.getRole()) ? "Executive Board" : (user.getCompany() != null ? user.getCompany().getName() : "Management"));
            dummy.setDesignation(user.getDesignation() != null && !user.getDesignation().isBlank()
                    ? user.getDesignation()
                    : ("SUPER_ADMIN".equalsIgnoreCase(user.getRole()) ? "Super Administrator" : "Administrator"));
            dummy.setCompany(user.getCompany());
            dummy.setPhone(user.getPhoneNumber());
            dummy.setEmployeeId(user.getEmployeeId());
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