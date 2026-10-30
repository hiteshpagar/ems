package com.ems.dto;

public class SuperAdminStatsDTO {
    private long totalAdmins;
    private long totalEmployees;
    private long totalDepartments;
    private long totalAuditLogs;
    private long totalCompanies;

    public SuperAdminStatsDTO() {}

    public SuperAdminStatsDTO(long totalAdmins, long totalEmployees, long totalDepartments, long totalAuditLogs) {
        this.totalAdmins = totalAdmins;
        this.totalEmployees = totalEmployees;
        this.totalDepartments = totalDepartments;
        this.totalAuditLogs = totalAuditLogs;
        this.totalCompanies = 0;
    }

    public SuperAdminStatsDTO(long totalAdmins, long totalEmployees, long totalDepartments, long totalAuditLogs, long totalCompanies) {
        this.totalAdmins = totalAdmins;
        this.totalEmployees = totalEmployees;
        this.totalDepartments = totalDepartments;
        this.totalAuditLogs = totalAuditLogs;
        this.totalCompanies = totalCompanies;
    }

    public long getTotalAdmins() {
        return totalAdmins;
    }

    public void setTotalAdmins(long totalAdmins) {
        this.totalAdmins = totalAdmins;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getTotalDepartments() {
        return totalDepartments;
    }

    public void setTotalDepartments(long totalDepartments) {
        this.totalDepartments = totalDepartments;
    }

    public long getTotalAuditLogs() {
        return totalAuditLogs;
    }

    public void setTotalAuditLogs(long totalAuditLogs) {
        this.totalAuditLogs = totalAuditLogs;
    }

    public long getTotalCompanies() {
        return totalCompanies;
    }

    public void setTotalCompanies(long totalCompanies) {
        this.totalCompanies = totalCompanies;
    }
}
