package employee_management_system_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.dto.DashboardStatsDTO;
import employee_management_system_backend.repository.EmployeeRepository;
import employee_management_system_backend.repository.LeaveRepository;
import employee_management_system_backend.repository.AttendanceRepository;
import java.time.LocalDate;
import employee_management_system_backend.dto.AttendanceStatsDTO;

@Service
public class DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;

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
    
    public AttendanceStatsDTO getAttendanceStats() {

        String today =
                LocalDate.now().toString();

        long presentToday =
                attendanceRepository.countByDate(
                        today
                );

        long checkedInToday =
                attendanceRepository.countByDate(
                        today
                );

        long totalEmployees =
                employeeRepository.count();

        long absentToday =
                totalEmployees - presentToday;

        return new AttendanceStatsDTO(
                presentToday,
                absentToday,
                checkedInToday
        );
    }
}