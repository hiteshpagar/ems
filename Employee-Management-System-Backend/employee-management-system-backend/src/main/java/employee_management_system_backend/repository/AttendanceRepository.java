package employee_management_system_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import employee_management_system_backend.entity.Attendance;

public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    Attendance findByEmployeeIdAndDate(
            Long employeeId,
            String date
    );
}