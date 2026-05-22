package employee_management_system_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.repository.EmployeeRepository;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    // Add Employee
    public Employee addEmployee(Employee employee) {

        return employeeRepository.save(employee);
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

            employee.setSalary(
                    updatedEmployee.getSalary());

            return employeeRepository.save(employee);
        }

        return null;
    }

    // Delete Employee
    public String deleteEmployee(Long id) {

        employeeRepository.deleteById(id);

        return "Employee Deleted Successfully";
    }
}