package com.ems.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ems.dto.DashboardStatsDTO;
import com.ems.dto.AttendanceStatsDTO;
import com.ems.entity.Employee;
import com.ems.entity.User;
import com.ems.repository.EmployeeRepository;
import com.ems.repository.LeaveRepository;
import com.ems.repository.AttendanceRepository;
import com.ems.repository.UserRepository;

import java.time.LocalDate;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private LeaveRepository leaveRepository;
    
    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private UserRepository userRepository;

    private boolean isRegularEmployee(Employee emp, String callerEmail) {
        if (emp == null) return false;

        String empEmail = emp.getEmail() != null ? emp.getEmail().trim().toLowerCase() : "";

        // Caller HR itself or Admin itself must never appear in total staff
        if (callerEmail != null && !callerEmail.isEmpty() && empEmail.equalsIgnoreCase(callerEmail)) {
            return false;
        }

        if (!empEmail.isEmpty()) {
            User u = userRepository.findByEmailIgnoreCase(empEmail);
            if (u != null) {
                String role = u.getRole() != null ? u.getRole().trim() : "";
                if ("ADMIN".equalsIgnoreCase(role) || "HR".equalsIgnoreCase(role) || "SUPER_ADMIN".equalsIgnoreCase(role)) {
                    return false;
                }
            }
        }

        String des = emp.getDesignation() != null ? emp.getDesignation().toLowerCase().trim() : "";
        String dept = emp.getDepartment() != null ? emp.getDepartment().toLowerCase().trim() : "";

        // Exclude Company Owner / Administrator variations
        if (des.contains("owner") || des.contains("admin") || des.contains("director") || des.contains("founder") || des.contains("ceo")) {
            return false;
        }

        // Exclude HR variations
        if (des.contains("hr") || des.contains("human resource")) {
            return false;
        }

        if (dept.contains("human resource") || dept.equals("hr")) {
            return false;
        }

        return true;
    }

    public DashboardStatsDTO getDashboardStats() {
        return getDashboardStats(null);
    }

    public DashboardStatsDTO getDashboardStats(String userEmail) {
        final String cleanUserEmail = (userEmail != null) ? userEmail.trim().toLowerCase() : null;
        User user = (userEmail != null && !userEmail.isBlank()) ? userRepository.findByEmailIgnoreCase(userEmail.trim()) : null;
        List<Employee> employees;
        if (user != null && user.getCompany() != null && !"SUPER_ADMIN".equalsIgnoreCase(user.getRole())) {
            employees = employeeRepository.findByCompanyId(user.getCompany().getId());
        } else {
            employees = employeeRepository.findAll();
        }

        // Only count actual regular staff members (excluding company owner and HR itself)
        long totalEmployees = employees.stream()
                .filter(emp -> isRegularEmployee(emp, cleanUserEmail))
                .count();

        long pendingLeaves = leaveRepository.countByStatus("Pending");
        long approvedLeaves = leaveRepository.countByStatus("Approved");
        long rejectedLeaves = leaveRepository.countByStatus("Rejected");

        return new DashboardStatsDTO(
                totalEmployees,
                pendingLeaves,
                approvedLeaves,
                rejectedLeaves
        );
    }
    
    public AttendanceStatsDTO getAttendanceStats() {
        return getAttendanceStats(null);
    }

    public AttendanceStatsDTO getAttendanceStats(String userEmail) {
        String today = LocalDate.now().toString();

        long presentToday = attendanceRepository.countByDate(today);
        long checkedInToday = attendanceRepository.countByDate(today);

        final String cleanUserEmail = (userEmail != null) ? userEmail.trim().toLowerCase() : null;
        User user = (userEmail != null && !userEmail.isBlank()) ? userRepository.findByEmailIgnoreCase(userEmail.trim()) : null;
        List<Employee> employees;
        if (user != null && user.getCompany() != null && !"SUPER_ADMIN".equalsIgnoreCase(user.getRole())) {
            employees = employeeRepository.findByCompanyId(user.getCompany().getId());
        } else {
            employees = employeeRepository.findAll();
        }

        long totalEmployees = employees.stream()
                .filter(emp -> isRegularEmployee(emp, cleanUserEmail))
                .count();

        long absentToday = Math.max(0, totalEmployees - presentToday);

        return new AttendanceStatsDTO(
                presentToday,
                absentToday,
                checkedInToday
        );
    }
}