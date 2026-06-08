package employee_management_system_backend.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.entity.Leave;
import employee_management_system_backend.repository.LeaveRepository;

@Service
public class LeaveService {

    @Autowired
    private LeaveRepository leaveRepository;

    // Apply Leave
    public Leave applyLeave(Leave leave) {

        leave.setStatus("Pending");

        return leaveRepository.save(leave);
    }

    // Get All Leaves
    public List<Leave> getAllLeaves() {

        return leaveRepository.findAll();
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

            leave.setStatus(status);

            return leaveRepository.save(leave);
        }

        return null;
    }

    // Delete Leave
    public String deleteLeave(Long id) {

        leaveRepository.deleteById(id);

        return "Leave Deleted Successfully";
    }
}