package employee_management_system_backend.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import employee_management_system_backend.entity.SalaryStructure;

public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {
    Optional<SalaryStructure> findByEmployeeId(Long employeeId);
    void deleteByEmployeeId(Long employeeId);
}
