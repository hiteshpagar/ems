package employee_management_system_backend.service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.entity.Leave;
import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.repository.LeaveRepository;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.entity.NotificationType;

@Service
public class LeaveService {

    private static final long ANNUAL_LEAVE_BALANCE_DAYS = 24;

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    // Apply Leave
    public Leave applyLeave(Leave leave) {

        if (leave.getEmployeeId() == null) throw new IllegalArgumentException("Employee is required.");
        if (leave.getLeaveType() == null || leave.getLeaveType().isBlank()) throw new IllegalArgumentException("Leave type is required.");
        if (leave.getStartDate() == null || leave.getEndDate() == null) throw new IllegalArgumentException("Leave start and end dates are required.");
        if (leave.getStartDate().isBefore(LocalDate.now())) throw new IllegalArgumentException("Leave cannot start in the past.");
        if (leave.getEndDate().isBefore(leave.getStartDate())) throw new IllegalArgumentException("Leave end date cannot be before its start date.");

        Employee employee = employeeService.getEmployeeById(leave.getEmployeeId());
        if (employee == null) throw new ResourceNotFoundException("Employee not found.");
        if (leaveRepository.countOverlappingActiveLeaves(leave.getEmployeeId(), leave.getStartDate(), leave.getEndDate()) > 0) {
            throw new IllegalArgumentException("This leave overlaps an existing pending or approved request.");
        }

        long requestedDays = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
        long usedDays = leaveRepository.findByEmployeeIdAndStatusNotIgnoreCase(leave.getEmployeeId(), "Rejected")
                .stream().filter(existing -> existing.getStartDate() != null && existing.getEndDate() != null
                        && existing.getStartDate().getYear() == leave.getStartDate().getYear())
                .mapToLong(existing -> ChronoUnit.DAYS.between(existing.getStartDate(), existing.getEndDate()) + 1).sum();
        if (usedDays + requestedDays > ANNUAL_LEAVE_BALANCE_DAYS) {
            throw new IllegalArgumentException("Leave balance exceeded. Annual allowance is " + ANNUAL_LEAVE_BALANCE_DAYS + " days.");
        }

        leave.setEmployeeName(employee.getName());
        leave.setStatus("Pending");

        Leave savedLeave = leaveRepository.save(leave);

        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.LEAVE,
                savedLeave.getId() != null ? savedLeave.getId().toString() : null,
                "Applied for " + savedLeave.getLeaveType() + " leave (" + savedLeave.getStartDate() + " to " + savedLeave.getEndDate() + ") for " + savedLeave.getEmployeeName()
        );

        notificationService.createForEmail(employee.getEmail(), "Leave request submitted",
                "Your " + savedLeave.getLeaveType() + " leave request has been submitted.", NotificationType.LEAVE);
        notificationService.createForAdministrators("New leave request",
                employee.getName() + " submitted a " + savedLeave.getLeaveType() + " leave request.", NotificationType.LEAVE);
        return savedLeave;
    }

    // Get All Leaves
    public List<Leave> getAllLeaves() {

        return leaveRepository.findAll();
    }
    
 // Get Logged In Employee Leaves
    public List<Leave> getMyLeaves(
            Long employeeId
    ) {

        return leaveRepository
                .findByEmployeeIdOrderByIdDesc(
                        employeeId
                );
    }
    
 // Get Logged In Employee Leave By Id
    public Leave getMyLeave(
            Long id,
            Long employeeId
    ) {

        return leaveRepository
                .findByIdAndEmployeeId(
                        id,
                        employeeId
                )
                .orElse(null);
    }

    // Get Leave By Id
    public Leave getLeaveById(Long id) {

        Optional<Leave> leave =
                leaveRepository.findById(id);

        return leave.orElse(null);
    }

    // Update Leave Status
    public Leave updateLeaveStatus(
            Long id,
            String status
    ) {

        Leave leave =
                leaveRepository.findById(id)
                .orElse(null);

        if (leave != null) {

            if (status == null || !(status.equalsIgnoreCase("Approved") || status.equalsIgnoreCase("Rejected"))) {
                throw new IllegalArgumentException("Leave status must be Approved or Rejected.");
            }

            leave.setStatus(status);

            Leave updatedLeave = leaveRepository.save(leave);

            AuditAction action = status.equalsIgnoreCase("Approved") ? AuditAction.APPROVE : AuditAction.REJECT;
            auditLogService.log(
                    action,
                    AuditModule.LEAVE,
                    updatedLeave.getId().toString(),
                    (status.equalsIgnoreCase("Approved") ? "Approved " : "Rejected ") + updatedLeave.getLeaveType() + " leave request for " + (updatedLeave.getEmployeeName() != null ? updatedLeave.getEmployeeName() : "Employee ID " + updatedLeave.getEmployeeId())
            );

            Employee employee =
                    employeeService.getEmployeeById(leave.getEmployeeId());

            if (employee != null && employee.getEmail() != null) {
                emailService.sendLeaveStatusEmail(employee, updatedLeave);
                notificationService.createForEmail(employee.getEmail(), "Leave request " + updatedLeave.getStatus(),
                        "Your " + updatedLeave.getLeaveType() + " leave request was " + updatedLeave.getStatus().toLowerCase() + ".", NotificationType.LEAVE);
            }

            return updatedLeave;
        }

        throw new ResourceNotFoundException("Leave not found.");
    }

    // Delete Leave
    public String deleteLeave(Long id) {

        Leave leave = leaveRepository.findById(id).orElse(null);
        if (leave == null) {
            throw new ResourceNotFoundException("Leave not found.");
        }

        leaveRepository.deleteById(id);

        auditLogService.log(
                AuditAction.DELETE,
                AuditModule.LEAVE,
                id.toString(),
                "Deleted " + leave.getLeaveType() + " leave request (ID: " + id + ") for " + (leave.getEmployeeName() != null ? leave.getEmployeeName() : "Employee ID " + leave.getEmployeeId())
        );

        return "Leave Deleted Successfully";
    }
}
