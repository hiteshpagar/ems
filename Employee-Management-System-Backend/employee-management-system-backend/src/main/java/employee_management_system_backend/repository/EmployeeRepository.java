package employee_management_system_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import employee_management_system_backend.entity.Employee;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long> {

}