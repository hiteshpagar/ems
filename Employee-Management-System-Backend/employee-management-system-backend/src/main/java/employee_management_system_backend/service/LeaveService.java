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
import employee_management_system_backend.entity.LeaveAllocation;
import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.repository.LeaveRepository;
import employee_management_system_backend.repository.LeaveAllocationRepository;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.entity.NotificationType;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    @Autowired
    private LeaveAllocationRepository leaveAllocationRepository;

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private AuditLogService auditLogService;

    // Get Leave Balance & Quotas (Default: Current Year)
    public LeaveBalanceDTO getLeaveBalance(Long employeeId) {
        return getLeaveBalance(employeeId, LocalDate.now().getYear());
    }

    // Get Leave Balance & Quotas for specific year
    public LeaveBalanceDTO getLeaveBalance(Long employeeId, Integer year) {
        if (employeeId == null) {
            throw new IllegalArgumentException("Employee ID is required.");
        }
        int targetYear = (year != null && year > 0) ? year : LocalDate.now().getYear();

        // Dynamic Quota totals aggregated from Admin quarterly allocations for target year
        List<LeaveAllocation> allocations = leaveAllocationRepository.findByEmployeeIdAndYear(employeeId, targetYear);
        long paidQuota = (long) Math.round(allocations.stream().mapToDouble(a -> a.getPaidLeaveQuota() != null ? a.getPaidLeaveQuota() : 0.0).sum());
        long sickQuota = (long) Math.round(allocations.stream().mapToDouble(a -> a.getSickLeaveQuota() != null ? a.getSickLeaveQuota() : 0.0).sum());
        long wfhQuota = (long) Math.round(allocations.stream().mapToDouble(a -> a.getWfhQuota() != null ? a.getWfhQuota() : 0.0).sum());
        long totalQuota = paidQuota + sickQuota + wfhQuota;

        List<Leave> activeLeaves = leaveRepository.findByEmployeeIdAndStatusNotIgnoreCase(employeeId, "Rejected");

        long paidUsed = 0;
        long sickUsed = 0;
        long wfhUsed = 0;
        long unpaidUsed = 0;
        long pendingDays = 0;
        long approvedDays = 0;

        for (Leave leave : activeLeaves) {
            if (leave.getStartDate() == null || leave.getEndDate() == null) continue;
            if (leave.getStartDate().getYear() == targetYear) {
                long days = ChronoUnit.DAYS.between(leave.getStartDate(), leave.getEndDate()) + 1;
                String type = leave.getLeaveType() != null ? leave.getLeaveType().trim().toLowerCase() : "";

                if (type.contains("unpaid")) {
                    unpaidUsed += days;
                } else if (type.contains("paid") || type.contains("annual")) {
                    paidUsed += days;
                } else if (type.contains("sick")) {
                    sickUsed += days;
                } else if (type.contains("wfh") || type.contains("home") || type.contains("casual")) {
                    wfhUsed += days;
                }

                if ("Pending".equalsIgnoreCase(leave.getStatus())) {
                    pendingDays += days;
                } else if ("Approved".equalsIgnoreCase(leave.getStatus())) {
                    approvedDays += days;
                }
            }
        }

        long totalUsed = paidUsed + sickUsed + wfhUsed;
        long paidAvailable = Math.max(0, paidQuota - paidUsed);
        long sickAvailable = Math.max(0, sickQuota - sickUsed);
        long wfhAvailable = Math.max(0, wfhQuota - wfhUsed);
        long totalAvailable = Math.max(0, totalQuota - totalUsed);

        return new LeaveBalanceDTO(
                targetYear,
                totalQuota,
                totalUsed,
                totalAvailable,
                paidQuota,
                paidUsed,
                paidAvailable,
                sickQuota,
                sickUsed,
                sickAvailable,
                wfhQuota,
                wfhUsed,
                wfhAvailable,
                unpaidUsed,
                pendingDays,
                approvedDays
        );
    }

    // Allocate Quarterly Leave Quota (Admin)
    public LeaveAllocation saveLeaveAllocation(LeaveAllocation allocation) {
        if (allocation.getEmployeeId() == null) {
            throw new IllegalArgumentException("Employee ID is required.");
        }
        if (allocation.getYear() == null || allocation.getYear() < 2000) {
            throw new IllegalArgumentException("Valid allocation year is required.");
        }
        if (allocation.getQuarter() == null || allocation.getQuarter() < 1 || allocation.getQuarter() > 4) {
            throw new IllegalArgumentException("Quarter must be between 1 and 4 (Q1 - Q4).");
        }

        Employee employee = employeeService.getEmployeeById(allocation.getEmployeeId());
        if (employee == null) {
            throw new ResourceNotFoundException("Employee not found with ID: " + allocation.getEmployeeId());
        }

        if (allocation.getPaidLeaveQuota() == null || allocation.getPaidLeaveQuota() < 0) allocation.setPaidLeaveQuota(0.0);
        if (allocation.getSickLeaveQuota() == null || allocation.getSickLeaveQuota() < 0) allocation.setSickLeaveQuota(0.0);
        if (allocation.getWfhQuota() == null || allocation.getWfhQuota() < 0) allocation.setWfhQuota(0.0);

        allocation.setEmployeeName(employee.getName());
        allocation.setAllocatedAt(LocalDate.now());

        // Upsert by (employeeId, year, quarter)
        LeaveAllocation saved = leaveAllocationRepository.findByEmployeeIdAndYearAndQuarter(
                allocation.getEmployeeId(), allocation.getYear(), allocation.getQuarter()
        ).map(existing -> {
            existing.setPaidLeaveQuota(allocation.getPaidLeaveQuota());
            existing.setSickLeaveQuota(allocation.getSickLeaveQuota());
            existing.setWfhQuota(allocation.getWfhQuota());
            existing.setRemarks(allocation.getRemarks());
            existing.setAllocatedAt(LocalDate.now());
            return leaveAllocationRepository.save(existing);
        }).orElseGet(() -> leaveAllocationRepository.save(allocation));

        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.LEAVE,
                saved.getId().toString(),
                "Allocated Q" + saved.getQuarter() + " " + saved.getYear() + " leave quota for " + saved.getEmployeeName() +
                        ": Paid=" + saved.getPaidLeaveQuota() + "d, Sick=" + saved.getSickLeaveQuota() + "d, WFH=" + saved.getWfhQuota() + "d"
        );

        if (employee.getEmail() != null) {
            notificationService.createForEmail(
                    employee.getEmail(),
                    "Q" + saved.getQuarter() + " Leave Quota Allocated",
                    "Your Q" + saved.getQuarter() + " " + saved.getYear() + " leave balance has been updated: " +
                            saved.getPaidLeaveQuota() + " Paid, " + saved.getSickLeaveQuota() + " Sick, " + saved.getWfhQuota() + " WFH days.",
                    NotificationType.LEAVE
            );
        }

        return saved;
    }

    public List<LeaveAllocation> getAllocations(Integer year) {
        int targetYear = (year != null && year > 0) ? year : LocalDate.now().getYear();
        return leaveAllocationRepository.findByYearOrderByEmployeeNameAscQuarterAsc(targetYear);
    }

    public List<LeaveAllocation> getAllocationsByEmployee(Long employeeId, Integer year) {
        if (employeeId == null) {
            return List.of();
        }
        if (year != null && year > 0) {
            return leaveAllocationRepository.findByEmployeeIdAndYear(employeeId, year);
        }
        return leaveAllocationRepository.findByEmployeeId(employeeId);
    }

    public String deleteAllocation(Long id) {
        LeaveAllocation existing = leaveAllocationRepository.findById(id).orElse(null);
        if (existing == null) {
            throw new ResourceNotFoundException("Leave allocation not found.");
        }
        leaveAllocationRepository.deleteById(id);
        auditLogService.log(
                AuditAction.DELETE,
                AuditModule.LEAVE,
                id.toString(),
                "Deleted Q" + existing.getQuarter() + " " + existing.getYear() + " leave allocation for " + existing.getEmployeeName()
        );
        return "Leave Allocation Deleted Successfully";
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
        LeaveBalanceDTO balance = getLeaveBalance(leave.getEmployeeId(), leave.getStartDate().getYear());

        String type = leave.getLeaveType() != null ? leave.getLeaveType().trim().toLowerCase() : "";

        // Unpaid Leave doesn't consume paid quota
        if (type.contains("unpaid")) {
            // Unpaid leave is allowed without quota deduction
        } else if (type.contains("paid") || type.contains("annual")) {
            if (requestedDays > balance.getPaidAvailable()) {
                throw new IllegalArgumentException("Paid leave quota exceeded for " + leave.getStartDate().getYear() + 
                        ". Available: " + balance.getPaidAvailable() + " day(s), requested: " + requestedDays + " day(s)." +
                        (balance.getPaidQuota() == 0 ? " (No quarterly paid leave has been allocated by Admin yet)" : ""));
            }
        } else if (type.contains("sick")) {
            if (requestedDays > balance.getSickAvailable()) {
                throw new IllegalArgumentException("Sick leave quota exceeded for " + leave.getStartDate().getYear() + 
                        ". Available: " + balance.getSickAvailable() + " day(s), requested: " + requestedDays + " day(s)." +
                        (balance.getSickQuota() == 0 ? " (No quarterly sick leave has been allocated by Admin yet)" : ""));
            }
        } else if (type.contains("wfh") || type.contains("home")) {
            if (requestedDays > balance.getWfhAvailable()) {
                throw new IllegalArgumentException("WFH quota exceeded for " + leave.getStartDate().getYear() + 
                        ". Available: " + balance.getWfhAvailable() + " day(s), requested: " + requestedDays + " day(s)." +
                        (balance.getWfhQuota() == 0 ? " (No quarterly WFH balance has been allocated by Admin yet)" : ""));
            }
        } else {
            // Any other leave type checked against total available
            if (requestedDays > balance.getTotalAvailable()) {
                throw new IllegalArgumentException("Leave balance exceeded. Available total allowance is " + balance.getTotalAvailable() + " day(s).");
            }
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
