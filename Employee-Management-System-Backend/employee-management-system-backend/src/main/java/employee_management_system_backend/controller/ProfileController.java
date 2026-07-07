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

    @GetMapping
    public Employee getProfile(
            Authentication authentication
    ) {

        return employeeService.getEmployeeByEmail(
                authentication.getName()
        );
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