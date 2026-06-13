package employee_management_system_backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import employee_management_system_backend.entity.Attendance;
import employee_management_system_backend.service.AttendanceService;

@RestController
@RequestMapping("/api/attendance")
@CrossOrigin("*")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

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