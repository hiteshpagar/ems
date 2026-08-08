package employee_management_system_backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import employee_management_system_backend.entity.Designation;

public interface DesignationRepository extends JpaRepository<Designation, Long> {

    Optional<Designation> findByNameIgnoreCaseAndDepartmentId(
            String name,
            Long departmentId
    );

    boolean existsByNameIgnoreCaseAndDepartmentId(
            String name,
            Long departmentId
    );
    
    boolean existsByNameIgnoreCaseAndDepartmentIdAndIdNot(
            String name,
            Long departmentId,
            Long id
    );

    List<Designation> findByDepartmentId(Long departmentId);

    long countByDepartmentId(Long departmentId);
}
