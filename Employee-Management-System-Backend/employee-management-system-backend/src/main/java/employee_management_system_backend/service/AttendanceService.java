package employee_management_system_backend.service;

import java.util.List;
import java.util.Optional;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import employee_management_system_backend.entity.Attendance;
import employee_management_system_backend.repository.AttendanceRepository;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    // Mark Attendance
    public Attendance markAttendance(
            Attendance attendance
    ) {
        return attendanceRepository.save(attendance);
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

            return attendanceRepository.save(attendance);
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

        return attendanceRepository.save(
                attendance
        );
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

        return attendanceRepository.save(
                attendance
        );
    }

    // Delete Attendance
    public String deleteAttendance(
            Long id
    ) {
        attendanceRepository.deleteById(id);

        return "Attendance Deleted Successfully";
    }
}