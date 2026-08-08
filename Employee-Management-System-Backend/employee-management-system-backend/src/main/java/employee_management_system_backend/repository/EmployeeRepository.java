package employee_management_system_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import employee_management_system_backend.entity.Employee;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long> {

    Employee findByEmail(
            String email
    );

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
    long countByDepartmentIgnoreCase(String department);
    long countByDesignationIgnoreCase(String designation);
}
