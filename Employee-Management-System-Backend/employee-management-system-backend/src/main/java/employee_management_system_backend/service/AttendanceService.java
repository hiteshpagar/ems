package employee_management_system_backend.service;

import java.util.List;
import java.util.Optional;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.entity.Attendance;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.repository.AttendanceRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private AuditLogService auditLogService;

    // Mark Attendance
    public Attendance markAttendance(
            Attendance attendance
    ) {
        Attendance saved = attendanceRepository.save(attendance);
        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.ATTENDANCE,
                saved.getId() != null ? saved.getId().toString() : null,
                "Marked attendance for " + saved.getEmployeeName() + " on " + saved.getDate()
        );
        return saved;
    }

    // Get All Attendance
    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    // Get Attendance By Id
    public Attendance getAttendanceById(
            Long id
    ) {
        Optional<Attendance> attendance =
                attendanceRepository.findById(id);

        return attendance.orElse(null);
    }
    
 // Get Attendance History By Employee
    public List<Attendance> getAttendanceHistory(
            Long employeeId
    ) {

        return attendanceRepository
                .findByEmployeeIdOrderByDateDesc(
                        employeeId
                );
    }

    // Update Attendance
    public Attendance updateAttendance(
            Long id,
            Attendance updatedAttendance
    ) {
        Attendance attendance =
                attendanceRepository.findById(id)
                .orElse(null);

        if (attendance != null) {

            attendance.setEmployeeId(
                    updatedAttendance.getEmployeeId());

            attendance.setEmployeeName(
                    updatedAttendance.getEmployeeName());

            attendance.setDate(
                    updatedAttendance.getDate());

            attendance.setCheckInTime(
                    updatedAttendance.getCheckInTime());

            attendance.setCheckOutTime(
                    updatedAttendance.getCheckOutTime());

            attendance.setStatus(
                    updatedAttendance.getStatus());

            Attendance saved = attendanceRepository.save(attendance);
            auditLogService.log(
                    AuditAction.UPDATE,
                    AuditModule.ATTENDANCE,
                    saved.getId().toString(),
                    "Updated attendance record for " + saved.getEmployeeName() + " on " + saved.getDate()
            );
            return saved;
        }

        return null;
    }
    
    public Attendance checkIn(
            Attendance attendance
    ) {

        String today =
                LocalDate.now().toString();

        Attendance existingAttendance =
                attendanceRepository
                        .findByEmployeeIdAndDate(
                                attendance.getEmployeeId(),
                                today
                        );

        if (existingAttendance != null) {
            return existingAttendance;
        }

        attendance.setDate(today);

        attendance.setCheckInTime(
                LocalTime.now()
                        .withNano(0)
                        .toString()
        );

        attendance.setStatus("Present");

        Attendance saved = attendanceRepository.save(
                attendance
        );

        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.ATTENDANCE,
                saved.getId() != null ? saved.getId().toString() : null,
                "Employee " + saved.getEmployeeName() + " checked in at " + saved.getCheckInTime()
        );

        return saved;
    }
    
    public Attendance checkOut(
            Long employeeId
    ) {

        String today =
                LocalDate.now().toString();

        Attendance attendance =
                attendanceRepository
                        .findByEmployeeIdAndDate(
                                employeeId,
                                today
                        );

        if (attendance == null) {
            return null;
        }

        if (attendance.getCheckOutTime() != null) {
            return attendance;
        }

        attendance.setCheckOutTime(
                LocalTime.now()
                        .withNano(0)
                        .toString()
        );

        Attendance saved = attendanceRepository.save(
                attendance
        );

        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.ATTENDANCE,
                saved.getId() != null ? saved.getId().toString() : null,
                "Employee " + saved.getEmployeeName() + " checked out at " + saved.getCheckOutTime()
        );

        return saved;
    }

 // Get Today's Attendance
    public Attendance getTodayAttendance(
            Long employeeId
    ) {

        String today =
                LocalDate.now().toString();

        return attendanceRepository
                .findByEmployeeIdAndDate(
                        employeeId,
                        today
                );
    }
    
    // Delete Attendance
    public String deleteAttendance(
            Long id
    ) {
        attendanceRepository.deleteById(id);
        auditLogService.log(
                AuditAction.DELETE,
                AuditModule.ATTENDANCE,
                id.toString(),
                "Deleted attendance record (ID: " + id + ")"
        );

        return "Attendance Deleted Successfully";
    }
}