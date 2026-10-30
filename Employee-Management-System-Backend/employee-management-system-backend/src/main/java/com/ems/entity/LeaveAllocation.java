package com.ems.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "leave_allocations", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employeeId", "year", "quarter"})
})
public class LeaveAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long employeeId;

    private String employeeName;

    @Column(nullable = false)
    private Integer year;

    @Column(nullable = false)
    private Integer quarter; // 1 = Q1, 2 = Q2, 3 = Q3, 4 = Q4

    private Double paidLeaveQuota = 0.0;
    private Double sickLeaveQuota = 0.0;
    private Double wfhQuota = 0.0;

    @Column(length = 500)
    private String remarks;

    private LocalDate allocatedAt;

    public LeaveAllocation() {
    }

    public LeaveAllocation(Long employeeId, String employeeName, Integer year, Integer quarter,
                           Double paidLeaveQuota, Double sickLeaveQuota, Double wfhQuota,
                           String remarks, LocalDate allocatedAt) {
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.year = year;
        this.quarter = quarter;
        this.paidLeaveQuota = paidLeaveQuota;
        this.sickLeaveQuota = sickLeaveQuota;
        this.wfhQuota = wfhQuota;
        this.remarks = remarks;
        this.allocatedAt = allocatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public Integer getQuarter() {
        return quarter;
    }

    public void setQuarter(Integer quarter) {
        this.quarter = quarter;
    }

    public Double getPaidLeaveQuota() {
        return paidLeaveQuota;
    }

    public void setPaidLeaveQuota(Double paidLeaveQuota) {
        this.paidLeaveQuota = paidLeaveQuota;
    }

    public Double getSickLeaveQuota() {
        return sickLeaveQuota;
    }

    public void setSickLeaveQuota(Double sickLeaveQuota) {
        this.sickLeaveQuota = sickLeaveQuota;
    }

    public Double getWfhQuota() {
        return wfhQuota;
    }

    public void setWfhQuota(Double wfhQuota) {
        this.wfhQuota = wfhQuota;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDate getAllocatedAt() {
        return allocatedAt;
    }

    public void setAllocatedAt(LocalDate allocatedAt) {
        this.allocatedAt = allocatedAt;
    }
}
