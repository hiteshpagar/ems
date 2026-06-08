package employee_management_system_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import employee_management_system_backend.entity.Leave;
import employee_management_system_backend.service.LeaveService;

@RestController
@RequestMapping("/api/leaves")
@CrossOrigin("*")
public class LeaveController {

    @Autowired
    private LeaveService leaveService;

    // Apply Leave
    @PostMapping
    public Leave applyLeave(
            @RequestBody Leave leave
    ) {

        return leaveService.applyLeave(leave);
    }

    // Get All Leaves
    @GetMapping
    public List<Leave> getAllLeaves() {

        return leaveService.getAllLeaves();
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