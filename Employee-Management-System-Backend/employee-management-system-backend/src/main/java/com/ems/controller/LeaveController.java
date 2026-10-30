package com.ems.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.ems.dto.LeaveBalanceDTO;
import com.ems.entity.Leave;
import com.ems.entity.LeaveAllocation;
import com.ems.service.LeaveService;

import org.springframework.security.core.Authentication;

import com.ems.entity.Employee;
import com.ems.service.EmployeeService;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin("*")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;
    
    @Autowired
    private EmployeeService employeeService;

    // Apply Leave
    @PostMapping
    public Leave applyLeave(
            @RequestBody Leave leave,
            Authentication authentication
    ) {

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_SUPER_ADMIN"));

        // Only ADMIN and SUPER_ADMIN can apply on behalf of other employees.
        // HR and regular employees can strictly only apply for their own personal leave.
        if (!isAdmin || leave.getEmployeeId() == null) {
            Employee employee = employeeService.getEmployeeByEmail(authentication.getName());
            if (employee == null) throw new IllegalArgumentException("No employee profile is linked to this account.");
            leave.setEmployeeId(employee.getId());
            leave.setEmployeeName(employee.getName());
        } else if (leave.getEmployeeName() == null || leave.getEmployeeName().isBlank()) {
            Employee targetEmp = employeeService.getEmployeeById(leave.getEmployeeId());
            if (targetEmp != null) {
                leave.setEmployeeName(targetEmp.getName());
            }
        }

        return leaveService.applyLeave(leave);
    }

    // Get Logged In Employee Leave Balance
    @GetMapping("/me/balance")
    public LeaveBalanceDTO getMyLeaveBalance(Authentication authentication) {
        Employee employee = employeeService.getEmployeeByEmail(authentication.getName());
        if (employee == null) {
            throw new IllegalArgumentException("No employee profile is linked to this account.");
        }
        return leaveService.getLeaveBalance(employee.getId());
    }

    // Get Employee Leave Balance (Admin)
    @GetMapping("/balance/{employeeId}")
    public LeaveBalanceDTO getLeaveBalanceByEmployeeId(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Integer year
    ) {
        return leaveService.getLeaveBalance(employeeId, year);
    }

    // Save Quarterly Leave Allocation (Admin)
    @PostMapping("/allocations")
    public LeaveAllocation saveLeaveAllocation(@RequestBody LeaveAllocation allocation) {
        return leaveService.saveLeaveAllocation(allocation);
    }

    // Get All Leave Allocations (Admin)
    @GetMapping("/allocations")
    public List<LeaveAllocation> getAllocations(@RequestParam(required = false) Integer year) {
        return leaveService.getAllocations(year);
    }

    // Get Leave Allocations for Employee
    @GetMapping("/allocations/{employeeId}")
    public List<LeaveAllocation> getAllocationsByEmployee(
            @PathVariable Long employeeId,
            @RequestParam(required = false) Integer year
    ) {
        return leaveService.getAllocationsByEmployee(employeeId, year);
    }

    // Delete Leave Allocation (Admin)
    @DeleteMapping("/allocations/{id}")
    public String deleteAllocation(@PathVariable Long id) {
        return leaveService.deleteAllocation(id);
    }

    // Get All Leaves
    @GetMapping
    public List<Leave> getAllLeaves() {

        return leaveService.getAllLeaves();
    }
    
 // Get Logged In Employee Leaves
    @GetMapping("/me")
    public List<Leave> getMyLeaves(
            Authentication authentication
    ) {

        Employee employee =
                employeeService.getEmployeeByEmail(
                        authentication.getName()
                );

        if (employee == null) {
            return List.of();
        }

        return leaveService.getMyLeaves(
                employee.getId()
        );
    }
    
 // Get Logged In Employee Leave By Id
    @GetMapping("/me/{id}")
    public Leave getMyLeave(
            @PathVariable Long id,
            Authentication authentication
    ) {

        Employee employee =
                employeeService.getEmployeeByEmail(
                        authentication.getName()
                );

        if (employee == null) {
            return null;
        }

        return leaveService.getMyLeave(
                id,
                employee.getId()
        );
    }

    // Get Leave By Id
    @GetMapping("/{id}")
    public Leave getLeaveById(
            @PathVariable Long id
    ) {

        return leaveService.getLeaveById(id);
    }

    // Update Leave Status
    @PutMapping("/{id}/status")
    public Leave updateLeaveStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {

        return leaveService.updateLeaveStatus(
                id,
                request.get("status")
        );
    }

    // Delete Leave
    @DeleteMapping("/{id}")
    public String deleteLeave(
            @PathVariable Long id
    ) {

        return leaveService.deleteLeave(id);
    }
}
