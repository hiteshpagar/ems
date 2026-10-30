package com.ems.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ems.entity.Attendance;



public interface AttendanceRepository
        extends JpaRepository<Attendance, Long> {

    Attendance findByEmployeeIdAndDate(
            Long employeeId,
            String date
    );
    
    List<Attendance> findByEmployeeIdOrderByDateDesc(
            Long employeeId
    );
    
    long countByDateAndStatus(
            String date,
            String status
    );

    long countByDate(
            String date
    );

    int countByEmployeeIdAndDateStartingWithAndStatusIgnoreCase(Long employeeId, String date, String status);
}
