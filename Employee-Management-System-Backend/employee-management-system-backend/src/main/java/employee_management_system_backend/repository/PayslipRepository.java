package employee_management_system_backend.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import employee_management_system_backend.entity.Payslip;

public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    List<Payslip> findAllByOrderByPayrollMonthDescEmployeeNameAsc();
    List<Payslip> findByEmployeeIdOrderByPayrollMonthDesc(Long employeeId);
    Optional<Payslip> findByEmployeeIdAndPayrollMonth(Long employeeId, String payrollMonth);
    boolean existsByPayrollMonth(String payrollMonth);
}
