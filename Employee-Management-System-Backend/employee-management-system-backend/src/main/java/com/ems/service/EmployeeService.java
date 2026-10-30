package com.ems.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ems.entity.AuditAction;
import com.ems.entity.AuditModule;
import com.ems.entity.Employee;
import com.ems.repository.EmployeeRepository;
import com.ems.entity.SalaryStructure;
import com.ems.repository.SalaryStructureRepository;

import com.ems.entity.User;
import com.ems.repository.UserRepository;
import com.ems.exception.ResourceAlreadyExistsException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.entity.NotificationType;

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

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    // Add Employee with creator user context
    public Employee addEmployee(Employee employee, String userEmail) {
        if (employee.getCompany() == null && userEmail != null) {
            User creator = userRepository.findByEmail(userEmail);
            if (creator != null && creator.getCompany() != null) {
                employee.setCompany(creator.getCompany());
            }
        }
        return addEmployee(employee);
    }

    // Add Employee
    public Employee addEmployee(Employee employee) {

        employee.setEmail(employee.getEmail().trim().toLowerCase());
        if (employeeRepository.existsByEmailIgnoreCase(employee.getEmail())) {
            throw new ResourceAlreadyExistsException("An employee with this email already exists.");
        }

        if (employee.getStatus() == null || employee.getStatus().isBlank()) {
            employee.setStatus("Active");
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

            user.setCompany(
                    savedEmployee.getCompany()
            );

            user.setDesignation(
                    savedEmployee.getDesignation()
            );

            if (savedEmployee.getPhone() != null && !savedEmployee.getPhone().isBlank()) {
                user.setPhoneNumber(savedEmployee.getPhone().trim());
            }

            if (savedEmployee.getEmployeeId() != null && !savedEmployee.getEmployeeId().isBlank()) {
                user.setEmployeeId(savedEmployee.getEmployeeId().trim());
            }

            User savedUser = userRepository.save(user);

            notificationService.createForUser(savedUser, "Welcome to Employee Management System",
                    "Your employee account has been created. Please sign in and change your temporary password.", NotificationType.EMPLOYEE);

            emailService.sendWelcomeEmail(
                    savedEmployee,
                    temporaryPassword
            );
        }

        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.EMPLOYEE,
                savedEmployee.getId() != null ? savedEmployee.getId().toString() : null,
                "Created employee " + savedEmployee.getName() + " (" + savedEmployee.getEmail() + ")"
                        + (savedEmployee.getCompany() != null ? " at Company: " + savedEmployee.getCompany().getName() : "")
        );

        return savedEmployee;
    }

    // Get Employees Scoped by Logged-in User's Company (Only regular staff, excluding company owner and HR)
    public List<Employee> getAllEmployeesForUser(String userEmail) {
        List<Employee> list;
        if (userEmail == null || userEmail.isBlank()) {
            list = employeeRepository.findAll();
        } else {
            User user = userRepository.findByEmailIgnoreCase(userEmail.trim());
            if (user == null || "SUPER_ADMIN".equalsIgnoreCase(user.getRole()) || user.getCompany() == null) {
                list = employeeRepository.findAll();
            } else {
                list = employeeRepository.findByCompanyId(user.getCompany().getId());
            }
        }
        return filterOutAdminsAndHrs(list, userEmail);
    }

    public List<Employee> filterOutAdminsAndHrs(List<Employee> employees) {
        return filterOutAdminsAndHrs(employees, null);
    }

    public List<Employee> filterOutAdminsAndHrs(List<Employee> employees, String callerEmail) {
        if (employees == null || employees.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        final String cleanCaller = (callerEmail != null) ? callerEmail.trim().toLowerCase() : null;

        return employees.stream()
                .filter(emp -> isRegularEmployee(emp, cleanCaller))
                .collect(java.util.stream.Collectors.toList());
    }

    public boolean isRegularEmployee(Employee emp, String callerEmail) {
        if (emp == null) return false;

        String empEmail = emp.getEmail() != null ? emp.getEmail().trim().toLowerCase() : "";

        // Caller HR itself or Admin itself must never appear in total staff
        if (callerEmail != null && !callerEmail.isEmpty() && empEmail.equalsIgnoreCase(callerEmail)) {
            return false;
        }

        if (!empEmail.isEmpty()) {
            User u = userRepository.findByEmailIgnoreCase(empEmail);
            if (u != null) {
                String role = u.getRole() != null ? u.getRole().trim() : "";
                if ("ADMIN".equalsIgnoreCase(role) || "HR".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role)) {
                    return false;
                }
            }
        }

        String des = emp.getDesignation() != null ? emp.getDesignation().toLowerCase().trim() : "";
        String dept = emp.getDepartment() != null ? emp.getDepartment().toLowerCase().trim() : "";

        // Exclude Company Owner / Administrator variations
        if (des.contains("owner") || des.contains("admin") || des.contains("director") || des.contains("founder") || des.contains("ceo")) {
            return false;
        }

        // Exclude HR variations
        if (des.contains("hr") || des.contains("human resource")) {
            return false;
        }

        if (dept.contains("human resource") || dept.equals("hr")) {
            return false;
        }

        return true;
    }

    // Get All Employees
    public List<Employee> getAllEmployees() {
        return filterOutAdminsAndHrs(employeeRepository.findAll(), null);
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
        if (email == null) return null;
        Employee employee = employeeRepository.findByEmail(email);
        if (employee != null) {
            return employee;
        }

        User user = userRepository.findByEmail(email);
        if (user != null) {
            // Return transient in-memory representation for non-employee roles without contaminating the employees table
            Employee transientEmp = new Employee();
            transientEmp.setId(user.getId());
            transientEmp.setName(user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getEmail());
            transientEmp.setEmail(user.getEmail());
            transientEmp.setDepartment("SUPER_ADMIN".equalsIgnoreCase(user.getRole()) ? "Executive Board" : "Human Resources");
            transientEmp.setDesignation(user.getDesignation() != null && !user.getDesignation().isBlank() ? user.getDesignation() : ("ADMIN".equalsIgnoreCase(user.getRole()) ? "Company Owner" : "HR Manager"));
            transientEmp.setSalary(0.0);
            transientEmp.setCompany(user.getCompany());
            transientEmp.setEmployeeId(user.getEmployeeId());
            transientEmp.setPhone(user.getPhoneNumber());
            return transientEmp;
        }

        return null;
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

            employee.setPhone(updatedEmployee.getPhone());
            employee.setEmployeeId(updatedEmployee.getEmployeeId());
            employee.setPersonalEmail(updatedEmployee.getPersonalEmail());
            employee.setDateOfBirth(updatedEmployee.getDateOfBirth());
            employee.setGender(updatedEmployee.getGender());
            employee.setBloodGroup(updatedEmployee.getBloodGroup());
            employee.setMaritalStatus(updatedEmployee.getMaritalStatus());
            employee.setEmploymentType(updatedEmployee.getEmploymentType());
            employee.setJoiningDate(updatedEmployee.getJoiningDate());
            employee.setWorkLocation(updatedEmployee.getWorkLocation());

            if (updatedEmployee.getStatus() != null && !updatedEmployee.getStatus().isBlank()) {
                employee.setStatus(updatedEmployee.getStatus());
            }

            employee.setBankName(updatedEmployee.getBankName());
            employee.setBankAccountNumber(updatedEmployee.getBankAccountNumber());
            employee.setIfscCode(updatedEmployee.getIfscCode());
            employee.setPanNumber(updatedEmployee.getPanNumber());
            employee.setAddress(updatedEmployee.getAddress());
            employee.setCity(updatedEmployee.getCity());
            employee.setState(updatedEmployee.getState());
            employee.setPostalCode(updatedEmployee.getPostalCode());

            if (updatedEmployee.getCountry() != null && !updatedEmployee.getCountry().isBlank()) {
                employee.setCountry(updatedEmployee.getCountry());
            }

            employee.setEmergencyContactName(updatedEmployee.getEmergencyContactName());
            employee.setEmergencyContactRelation(updatedEmployee.getEmergencyContactRelation());
            employee.setEmergencyContactPhone(updatedEmployee.getEmergencyContactPhone());

            Employee savedEmployee = employeeRepository.save(employee);

            // Keep the employee record and payroll structure in sync when basic pay changes.
            syncBasicSalary(savedEmployee);

            auditLogService.log(
                    AuditAction.UPDATE,
                    AuditModule.EMPLOYEE,
                    savedEmployee.getId().toString(),
                    "Updated employee " + savedEmployee.getName()
            );

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
            User user = userRepository.findByEmail(email);
            if (user != null) {
                if (updatedEmployee.getName() != null && !updatedEmployee.getName().isBlank()) {
                    user.setFullName(updatedEmployee.getName().trim());
                }
                if (updatedEmployee.getPhone() != null) {
                    user.setPhoneNumber(updatedEmployee.getPhone().trim());
                }
                userRepository.save(user);

                Employee dummy = new Employee();
                dummy.setId(user.getId());
                dummy.setName(user.getFullName());
                dummy.setEmail(user.getEmail());
                dummy.setPhone(user.getPhoneNumber());
                dummy.setEmployeeId(user.getEmployeeId());
                dummy.setDepartment("SUPER_ADMIN".equalsIgnoreCase(user.getRole()) ? "Executive Board" : (user.getCompany() != null ? user.getCompany().getName() : "Management"));
                dummy.setDesignation(user.getDesignation() != null ? user.getDesignation() : "Administrator");
                dummy.setCompany(user.getCompany());
                return dummy;
            }
            return null;
        }

        // Editable Fields
        if (updatedEmployee.getName() != null && !updatedEmployee.getName().isBlank()) {
            employee.setName(updatedEmployee.getName().trim());
        }
        if (updatedEmployee.getPhone() != null) {
            employee.setPhone(updatedEmployee.getPhone().trim());
        }

        // Non-editable fields:
        // Email
        // Department
        // Salary
        // Photo
        // Role

        Employee saved = employeeRepository.save(employee);

        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.PROFILE,
                saved.getId() != null ? saved.getId().toString() : null,
                "Updated personal profile for " + saved.getName()
        );

        return saved;
    }

    // Delete Employee
    public String deleteEmployee(Long id) {

        Employee employee = employeeRepository.findById(id).orElse(null);
        if (employee == null) {
            throw new ResourceNotFoundException("Employee not found.");
        }
        String employeeName = employee.getName();

        salaryStructureRepository.deleteByEmployeeId(id);
        employeeRepository.deleteById(id);

        auditLogService.log(
                AuditAction.DELETE,
                AuditModule.EMPLOYEE,
                id.toString(),
                "Deleted employee " + employeeName + " (ID: " + id + ")"
        );

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
