package employee_management_system_backend.dto;

public class LeaveBalanceDTO {

    private long totalQuota;
    private long totalUsed;
    private long totalAvailable;

    private long casualQuota;
    private long casualUsed;
    private long casualAvailable;

    private long sickQuota;
    private long sickUsed;
    private long sickAvailable;

    private long paidQuota;
    private long paidUsed;
    private long paidAvailable;

    private long pendingDays;
    private long approvedDays;

    public LeaveBalanceDTO() {
    }

    public LeaveBalanceDTO(long totalQuota, long totalUsed, long totalAvailable,
                           long casualQuota, long casualUsed, long casualAvailable,
                           long sickQuota, long sickUsed, long sickAvailable,
                           long paidQuota, long paidUsed, long paidAvailable,
                           long pendingDays, long approvedDays) {
        this.totalQuota = totalQuota;
        this.totalUsed = totalUsed;
        this.totalAvailable = totalAvailable;
        this.casualQuota = casualQuota;
        this.casualUsed = casualUsed;
        this.casualAvailable = casualAvailable;
        this.sickQuota = sickQuota;
        this.sickUsed = sickUsed;
        this.sickAvailable = sickAvailable;
        this.paidQuota = paidQuota;
        this.paidUsed = paidUsed;
        this.paidAvailable = paidAvailable;
        this.pendingDays = pendingDays;
        this.approvedDays = approvedDays;
    }

    public long getTotalQuota() {
        return totalQuota;
    }

    public void setTotalQuota(long totalQuota) {
        this.totalQuota = totalQuota;
    }

    public long getTotalUsed() {
        return totalUsed;
    }

    public void setTotalUsed(long totalUsed) {
        this.totalUsed = totalUsed;
    }

    public long getTotalAvailable() {
        return totalAvailable;
    }

    public void setTotalAvailable(long totalAvailable) {
        this.totalAvailable = totalAvailable;
    }

    public long getCasualQuota() {
        return casualQuota;
    }

    public void setCasualQuota(long casualQuota) {
        this.casualQuota = casualQuota;
    }

    public long getCasualUsed() {
        return casualUsed;
    }

    public void setCasualUsed(long casualUsed) {
        this.casualUsed = casualUsed;
    }

    public long getCasualAvailable() {
        return casualAvailable;
    }

    public void setCasualAvailable(long casualAvailable) {
        this.casualAvailable = casualAvailable;
    }

    public long getSickQuota() {
        return sickQuota;
    }

    public void setSickQuota(long sickQuota) {
        this.sickQuota = sickQuota;
    }

    public long getSickUsed() {
        return sickUsed;
    }

    public void setSickUsed(long sickUsed) {
        this.sickUsed = sickUsed;
    }

    public long getSickAvailable() {
        return sickAvailable;
    }

    public void setSickAvailable(long sickAvailable) {
        this.sickAvailable = sickAvailable;
    }

    public long getPaidQuota() {
        return paidQuota;
    }

    public void setPaidQuota(long paidQuota) {
        this.paidQuota = paidQuota;
    }

    public long getPaidUsed() {
        return paidUsed;
    }

    public void setPaidUsed(long paidUsed) {
        this.paidUsed = paidUsed;
    }

    public long getPaidAvailable() {
        return paidAvailable;
    }

    public void setPaidAvailable(long paidAvailable) {
        this.paidAvailable = paidAvailable;
    }

    public long getPendingDays() {
        return pendingDays;
    }

    public void setPendingDays(long pendingDays) {
        this.pendingDays = pendingDays;
    }

    public long getApprovedDays() {
        return approvedDays;
    }

    public void setApprovedDays(long approvedDays) {
        this.approvedDays = approvedDays;
    }
}
