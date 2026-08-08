package employee_management_system_backend.dto;

public class DashboardStatsDTO {

    private long totalEmployees;
    private long pendingLeaves;
    private long approvedLeaves;
    private long rejectedLeaves;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(
            long totalEmployees,
            long pendingLeaves,
            long approvedLeaves,
            long rejectedLeaves
    ) {
        this.totalEmployees = totalEmployees;
        this.pendingLeaves = pendingLeaves;
        this.approvedLeaves = approvedLeaves;
        this.rejectedLeaves = rejectedLeaves;
    }

    public long getTotalEmployees() {
        return totalEmployees;
    }

    public void setTotalEmployees(long totalEmployees) {
        this.totalEmployees = totalEmployees;
    }

    public long getPendingLeaves() {
        return pendingLeaves;
    }

    public void setPendingLeaves(long pendingLeaves) {
        this.pendingLeaves = pendingLeaves;
    }

    public long getApprovedLeaves() {
        return approvedLeaves;
    }

    public void setApprovedLeaves(long approvedLeaves) {
        this.approvedLeaves = approvedLeaves;
    }

    public long getRejectedLeaves() {
        return rejectedLeaves;
    }

    public void setRejectedLeaves(long rejectedLeaves) {
        this.rejectedLeaves = rejectedLeaves;
    }
}