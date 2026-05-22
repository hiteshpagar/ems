package employee_management_system_backend.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.service.EmployeeService;

@RestController
@RequestMapping("/api/employees")
@CrossOrigin("*")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    // Add Employee
    @PostMapping
    public Employee addEmployee(
            @RequestBody Employee employee
    ) {

        return employeeService.addEmployee(employee);
    }

    // Get All Employees
    @GetMapping
    public List<Employee> getAllEmployees() {

        return employeeService.getAllEmployees();
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
            @RequestBody Employee employee
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