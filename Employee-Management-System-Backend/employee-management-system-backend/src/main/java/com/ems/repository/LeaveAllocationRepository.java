package com.ems.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ems.entity.LeaveAllocation;

@Repository
public interface LeaveAllocationRepository extends JpaRepository<LeaveAllocation, Long> {

    List<LeaveAllocation> findByEmployeeIdAndYear(Long employeeId, Integer year);

    List<LeaveAllocation> findByEmployeeId(Long employeeId);

    List<LeaveAllocation> findByYear(Integer year);

    List<LeaveAllocation> findByYearOrderByEmployeeNameAscQuarterAsc(Integer year);

    Optional<LeaveAllocation> findByEmployeeIdAndYearAndQuarter(Long employeeId, Integer year, Integer quarter);
}
