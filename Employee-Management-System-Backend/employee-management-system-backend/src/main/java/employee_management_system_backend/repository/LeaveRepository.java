package employee_management_system_backend.repository;

import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import employee_management_system_backend.entity.Leave;

public interface LeaveRepository
        extends JpaRepository<Leave, Long> {

    long countByStatus(
            String status
    );

    List<Leave> findByEmployeeIdOrderByIdDesc(
            Long employeeId
    );
    
    Optional<Leave> findByIdAndEmployeeId(
            Long id,
            Long employeeId
    );
}