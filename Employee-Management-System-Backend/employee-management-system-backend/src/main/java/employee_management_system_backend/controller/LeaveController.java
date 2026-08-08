package employee_management_system_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import employee_management_system_backend.entity.Leave;
import employee_management_system_backend.service.LeaveService;

import org.springframework.security.core.Authentication;

import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.service.EmployeeService;

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
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
        if (!isAdmin) {
            Employee employee = employeeService.getEmployeeByEmail(authentication.getName());
            if (employee == null) throw new IllegalArgumentException("No employee profile is linked to this account.");
            leave.setEmployeeId(employee.getId());
        }

        return leaveService.applyLeave(leave);
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
