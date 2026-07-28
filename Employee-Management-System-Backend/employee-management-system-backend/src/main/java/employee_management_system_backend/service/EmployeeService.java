package employee_management_system_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.repository.EmployeeRepository;

import employee_management_system_backend.entity.User;
import employee_management_system_backend.repository.UserRepository;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private UserRepository userRepository;

    // Add Employee
    public Employee addEmployee(Employee employee) {

        // Save Employee
        Employee savedEmployee =
                employeeRepository.save(employee);

        // Check if user already exists
        User existingUser =
                userRepository.findByEmail(
                        employee.getEmail()
                );

        if (existingUser == null) {

            User user = new User();

            user.setFullName(
                    employee.getName()
            );

            user.setEmail(
                    employee.getEmail()
            );

            // Temporary Password
            user.setPassword(
                    "Welcome@123"
            );

            user.setRole(
                    "EMPLOYEE"
            );

            userRepository.save(user);
        }

        return savedEmployee;
    }

    // Get All Employees
    public List<Employee> getAllEmployees() {

        return employeeRepository.findAll();
    }

    // Get Employee By ID
    public Employee getEmployeeById(Long id) {

        Optional<Employee> employee =
                employeeRepository.findById(id);

        return employee.orElse(null);
    }
    
 // Get Employee By Email
    public Employee getEmployeeByEmail(
            String email
    ) {

        return employeeRepository.findByEmail(
                email
        );
    }

    // Update Employee
    public Employee updateEmployee(
            Long id,
            Employee updatedEmployee
    ) {

        Employee employee =
                employeeRepository.findById(id)
                .orElse(null);

        if (employee != null) {

            employee.setName(
                    updatedEmployee.getName());

            employee.setEmail(
                    updatedEmployee.getEmail());

            employee.setDepartment(
                    updatedEmployee.getDepartment());

            employee.setDesignation(
                    updatedEmployee.getDesignation());

            employee.setSalary(
                    updatedEmployee.getSalary());
            
            employee.setPhotoUrl(
                    updatedEmployee.getPhotoUrl());

            return employeeRepository.save(employee);
        }

        return null;
    }
    
 // Update Logged In Employee Profile
    public Employee updateMyProfile(
            String email,
            Employee updatedEmployee
    ) {

        Employee employee =
                employeeRepository.findByEmail(email);

        if (employee == null) {
            return null;
        }

        // Editable Fields
        employee.setName(
                updatedEmployee.getName()
        );

        // Non-editable fields:
        // Email
        // Department
        // Salary
        // Photo
        // Role

        return employeeRepository.save(employee);
    }

    // Delete Employee
    public String deleteEmployee(Long id) {

        employeeRepository.deleteById(id);

        return "Employee Deleted Successfully";
    }
}
