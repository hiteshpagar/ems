package employee_management_system_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.dto.DashboardStatsDTO;
import employee_management_system_backend.repository.EmployeeRepository;
import employee_management_system_backend.repository.LeaveRepository;

@Service
public class DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;

    public DashboardStatsDTO getDashboardStats() {

        long totalEmployees =
                employeeRepository.count();

        long pendingLeaves =
                leaveRepository.countByStatus("Pending");

        long approvedLeaves =
                leaveRepository.countByStatus("Approved");

        long rejectedLeaves =
                leaveRepository.countByStatus("Rejected");

        return new DashboardStatsDTO(
                totalEmployees,
                pendingLeaves,
                approvedLeaves,
                rejectedLeaves
        );
    }
}