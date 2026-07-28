package employee_management_system_backend.repository;



import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import employee_management_system_backend.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    Optional<Department> findByName(String name);

    boolean existsByName(String name);
}