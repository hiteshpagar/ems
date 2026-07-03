package employee_management_system_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import employee_management_system_backend.entity.Attendance;
import employee_management_system_backend.service.AttendanceService;
import org.springframework.security.core.Authentication;

import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.service.EmployeeService;

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
            @RequestBody Attendance attendance
    ) {
        return attendanceService.markAttendance(
                attendance);
    }
    
    @PostMapping("/check-in")
    public Attendance checkIn(
            @RequestBody Attendance attendance
    ) {
        return attendanceService
                .checkIn(attendance);
    }
    
    @PostMapping("/check-out")
    public Attendance checkOut(
            @RequestBody Map<String, Long> request
    ) {

        Long employeeId =
                request.get("employeeId");

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