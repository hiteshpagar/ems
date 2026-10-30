package com.ems.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.ems.entity.Attendance;
import com.ems.service.AttendanceService;
import org.springframework.security.core.Authentication;

import com.ems.entity.Employee;
import com.ems.service.EmployeeService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;
    
    @Autowired
    private EmployeeService employeeService;

    @PostMapping
    public Attendance markAttendance(
            @RequestBody Attendance attendance,
            Authentication authentication
    ) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_SUPER_ADMIN"));

        if (!isAdmin) {
            Employee employee = employeeService.getEmployeeByEmail(authentication.getName());
            if (employee == null) {
                throw new IllegalArgumentException("No employee profile is linked to this account.");
            }
            attendance.setEmployeeId(employee.getId());
            attendance.setEmployeeName(employee.getName());
        }

        return attendanceService.markAttendance(
                attendance);
    }
    
    @PostMapping("/check-in")
    public Attendance checkIn(
            @RequestBody Attendance attendance,
            Authentication authentication
    ) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_SUPER_ADMIN"));

        // Only ADMIN and SUPER_ADMIN can check in on behalf of other employees.
        // HR and regular employees can strictly only check in for themselves.
        if (!isAdmin || attendance.getEmployeeId() == null) {
            Employee employee = employeeService.getEmployeeByEmail(authentication.getName());
            if (employee == null) {
                throw new IllegalArgumentException("No employee profile is linked to this account.");
            }
            attendance.setEmployeeId(employee.getId());
            attendance.setEmployeeName(employee.getName());
        }

        return attendanceService
                .checkIn(attendance);
    }
    
    @PostMapping("/check-out")
    public Attendance checkOut(
            @RequestBody Map<String, Long> request,
            Authentication authentication
    ) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_SUPER_ADMIN"));

        Long employeeId = request != null ? request.get("employeeId") : null;

        // Only ADMIN and SUPER_ADMIN can check out on behalf of other employees.
        // HR and regular employees can strictly only check out for themselves.
        if (!isAdmin || employeeId == null) {
            Employee employee = employeeService.getEmployeeByEmail(authentication.getName());
            if (employee == null) {
                throw new IllegalArgumentException("No employee profile is linked to this account.");
            }
            employeeId = employee.getId();
        }

        return attendanceService
                .checkOut(employeeId);
    }
    
 // Get Today's Attendance For Logged In Employee
    @GetMapping("/me/today")
    public Attendance getTodayAttendance(
            Authentication authentication
    ) {

        Employee employee =
                employeeService.getEmployeeByEmail(
                        authentication.getName()
                );

        if (employee == null) {
            return null;
        }

        return attendanceService.getTodayAttendance(
                employee.getId()
        );
    }
    
 // Get Attendance History Of Logged In Employee
    @GetMapping("/me")
    public List<Attendance> getMyAttendance(
            Authentication authentication
    ) {

        Employee employee =
                employeeService.getEmployeeByEmail(
                        authentication.getName()
                );

        if (employee == null) {
            return List.of();
        }

        return attendanceService.getAttendanceHistory(
                employee.getId()
        );
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/{id}")
    public Attendance getAttendanceById(
            @PathVariable Long id
    ) {
        return attendanceService.getAttendanceById(
                id);
    }

    @PutMapping("/{id}")
    public Attendance updateAttendance(
            @PathVariable Long id,
            @RequestBody Attendance attendance
    ) {
        return attendanceService.updateAttendance(
                id,
                attendance);
    }

    @DeleteMapping("/{id}")
    public String deleteAttendance(
            @PathVariable Long id
    ) {
        return attendanceService.deleteAttendance(
                id);
    }
}