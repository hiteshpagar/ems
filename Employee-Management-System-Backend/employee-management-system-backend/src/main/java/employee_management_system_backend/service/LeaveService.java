package employee_management_system_backend.service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.dto.LeaveBalanceDTO;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.entity.Leave;
import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.repository.LeaveRepository;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.entity.NotificationType;

@Service
public class LeaveService {

    public static final long ANNUAL_LEAVE_BALANCE_DAYS = 24;
    public static final long CASUAL_LEAVE_QUOTA = 12;
    public static final long SICK_LEAVE_QUOTA = 8;
    public static final long PAID_LEAVE_QUOTA = 4;

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

    // Get Leave Balance & Quotas
    public LeaveBalanceDTO getLeaveBalance(Long employeeId) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Employee ID is required.");
        }

        int currentYear = LocalDate.now().getYear();
        List<Leave> activeLeaves = leaveRepository.findByEmployeeIdAndStatusNotIgnoreCase(employeeId, "Rejected");

        long casualUsed = 0;
        long sickUsed = 0;
        long paidUsed = 0;
        long totalUsed = 0;
        long pendingDays = 0;
        long approvedDays = 0;

        for (Leave leave : activeLeaves) {
            if (leave.getStartDate() == null || leave.getEndDate() == null) continue;
            if (leave.getStartDate().getYear() == currentYear) {
                long days = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
                totalUsed += days;

                String type = leave.getLeaveType() != null ? leave.getLeaveType().trim().toLowerCase() : "";
                if (type.contains("casual")) {
                    casualUsed += days;
                } else if (type.contains("sick")) {
                    sickUsed += days;
                } else if (type.contains("paid") || type.contains("annual")) {
                    paidUsed += days;
                }

                if ("Pending".equalsIgnoreCase(leave.getStatus())) {
                    pendingDays += days;
                } else if ("Approved".equalsIgnoreCase(leave.getStatus())) {
                    approvedDays += days;
                }
            }
        }

        long totalAvailable = Math.max(0, ANNUAL_LEAVE_BALANCE_DAYS - totalUsed);
        long casualAvailable = Math.max(0, CASUAL_LEAVE_QUOTA - casualUsed);
        long sickAvailable = Math.max(0, SICK_LEAVE_QUOTA - sickUsed);
        long paidAvailable = Math.max(0, PAID_LEAVE_QUOTA - paidUsed);

        return new LeaveBalanceDTO(
                ANNUAL_LEAVE_BALANCE_DAYS,
                totalUsed,
                totalAvailable,
                CASUAL_LEAVE_QUOTA,
                casualUsed,
                casualAvailable,
                SICK_LEAVE_QUOTA,
                sickUsed,
                sickAvailable,
                PAID_LEAVE_QUOTA,
                paidUsed,
                paidAvailable,
                pendingDays,
                approvedDays
        );
    }

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
        LeaveBalanceDTO balance = getLeaveBalance(leave.getEmployeeId());

        if (requestedDays > balance.getTotalAvailable()) {
            throw new IllegalArgumentException("Leave balance exceeded. Available total allowance is " + balance.getTotalAvailable() + " day(s).");
        }

        String type = leave.getLeaveType() != null ? leave.getLeaveType().trim().toLowerCase() : "";
        if (type.contains("casual") && requestedDays > balance.getCasualAvailable()) {
            throw new IllegalArgumentException("Casual leave quota exceeded. Available: " + balance.getCasualAvailable() + " day(s), requested: " + requestedDays + " day(s).");
        } else if (type.contains("sick") && requestedDays > balance.getSickAvailable()) {
            throw new IllegalArgumentException("Sick leave quota exceeded. Available: " + balance.getSickAvailable() + " day(s), requested: " + requestedDays + " day(s).");
        } else if ((type.contains("paid") || type.contains("annual")) && requestedDays > balance.getPaidAvailable()) {
            throw new IllegalArgumentException("Paid/Annual leave quota exceeded. Available: " + balance.getPaidAvailable() + " day(s), requested: " + requestedDays + " day(s).");
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
