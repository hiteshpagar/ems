package employee_management_system_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.repository.EmployeeRepository;
import employee_management_system_backend.entity.SalaryStructure;
import employee_management_system_backend.repository.SalaryStructureRepository;

import employee_management_system_backend.entity.User;
import employee_management_system_backend.repository.UserRepository;
import employee_management_system_backend.exception.ResourceAlreadyExistsException;
import employee_management_system_backend.exception.ResourceNotFoundException;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private SalaryStructureRepository salaryStructureRepository;

    // Add Employee
    public Employee addEmployee(Employee employee) {

        employee.setEmail(employee.getEmail().trim().toLowerCase());
        if (employeeRepository.existsByEmailIgnoreCase(employee.getEmail())) {
            throw new ResourceAlreadyExistsException("An employee with this email already exists.");
        }

        // Save Employee
        Employee savedEmployee =
                employeeRepository.save(employee);

        // The salary entered at onboarding is the employee's monthly basic pay.
        // Create its matching structure immediately so payroll always uses the same value.
        syncBasicSalary(savedEmployee);

        // Check if user already exists
        User existingUser =
                userRepository.findByEmail(
                        employee.getEmail()
                );

        if (existingUser == null) {

            User user = new User();
            String temporaryPassword = "Welcome@123";

            user.setFullName(
                    employee.getName()
            );

            user.setEmail(
                    employee.getEmail()
            );

            // Temporary Password
            user.setPassword(
                    temporaryPassword
            );

            user.setRole(
                    "EMPLOYEE"
            );

            userRepository.save(user);

            emailService.sendWelcomeEmail(
                    savedEmployee,
                    temporaryPassword
            );
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

            String email = updatedEmployee.getEmail().trim().toLowerCase();
            if (employeeRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
                throw new ResourceAlreadyExistsException("An employee with this email already exists.");
            }

            employee.setName(
                    updatedEmployee.getName());

            employee.setEmail(
                    email);

            employee.setDepartment(
                    updatedEmployee.getDepartment());

            employee.setDesignation(
                    updatedEmployee.getDesignation());

            employee.setSalary(
                    updatedEmployee.getSalary());
            
            employee.setPhotoUrl(
                    updatedEmployee.getPhotoUrl());

            Employee savedEmployee = employeeRepository.save(employee);

            // Keep the employee record and payroll structure in sync when basic pay changes.
            syncBasicSalary(savedEmployee);

            return savedEmployee;
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

        if (!employeeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Employee not found.");
        }
        salaryStructureRepository.deleteByEmployeeId(id);
        employeeRepository.deleteById(id);

        return "Employee Deleted Successfully";
    }

    private void syncBasicSalary(Employee employee) {
        SalaryStructure structure = salaryStructureRepository
                .findByEmployeeId(employee.getId())
                .orElseGet(SalaryStructure::new);

        structure.setEmployeeId(employee.getId());
        structure.setBasicSalary(employee.getSalary() == null ? 0.0 : employee.getSalary());

        salaryStructureRepository.save(structure);
    }
}
