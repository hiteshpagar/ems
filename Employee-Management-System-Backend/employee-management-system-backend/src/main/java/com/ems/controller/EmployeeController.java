package com.ems.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.ems.entity.Employee;
import com.ems.service.EmployeeService;
import jakarta.validation.Valid;

import org.springframework.security.core.Authentication;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    // Add Employee
    @PostMapping
    public Employee addEmployee(
            @Valid @RequestBody Employee employee,
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        return employeeService.addEmployee(employee, userEmail);
    }

    // Get All Employees
    @GetMapping
    public List<Employee> getAllEmployees(
            Authentication authentication
    ) {
        String userEmail = authentication != null ? authentication.getName() : null;
        return employeeService.getAllEmployeesForUser(userEmail);
    }
    
 // Get Logged In Employee
    @GetMapping("/me")
    public Employee getLoggedInEmployee(
            Authentication authentication
    ) {

        return employeeService.getEmployeeByEmail(
                authentication.getName()
        );
    }

    // Get Employee By ID
    @GetMapping("/{id}")
    public Employee getEmployeeById(
            @PathVariable Long id
    ) {

        return employeeService.getEmployeeById(id);
    }

    // Update Employee
    @PutMapping("/{id}")
    public Employee updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody Employee employee
    ) {

        return employeeService.updateEmployee(
                id,
                employee
        );
    }

    // Delete Employee
    @DeleteMapping("/{id}")
    public String deleteEmployee(
            @PathVariable Long id
    ) {

        return employeeService.deleteEmployee(id);
    }
}
