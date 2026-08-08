package employee_management_system_backend.repository;

import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    @Query("select count(l) from Leave l where l.employeeId = :employeeId and lower(l.status) in ('pending', 'approved') and l.startDate <= :endDate and l.endDate >= :startDate")
    long countOverlappingActiveLeaves(@Param("employeeId") Long employeeId,
            @Param("startDate") java.time.LocalDate startDate, @Param("endDate") java.time.LocalDate endDate);

    List<Leave> findByEmployeeIdAndStatusNotIgnoreCase(Long employeeId, String status);
}
