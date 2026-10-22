package employee_management_system_backend.dto;

public class LeaveBalanceDTO {

    private int year;

    private long totalQuota;
    private long totalUsed;
    private long totalAvailable;

    private long paidQuota;
    private long paidUsed;
    private long paidAvailable;

    private long sickQuota;
    private long sickUsed;
    private long sickAvailable;

    private long wfhQuota;
    private long wfhUsed;
    private long wfhAvailable;

    private long unpaidUsed;

    private long pendingDays;
    private long approvedDays;

    public LeaveBalanceDTO() {
    }

    public LeaveBalanceDTO(int year, long totalQuota, long totalUsed, long totalAvailable,
                           long paidQuota, long paidUsed, long paidAvailable,
                           long sickQuota, long sickUsed, long sickAvailable,
                           long wfhQuota, long wfhUsed, long wfhAvailable,
                           long unpaidUsed, long pendingDays, long approvedDays) {
        this.year = year;
        this.totalQuota = totalQuota;
        this.totalUsed = totalUsed;
        this.totalAvailable = totalAvailable;
        this.paidQuota = paidQuota;
        this.paidUsed = paidUsed;
        this.paidAvailable = paidAvailable;
        this.sickQuota = sickQuota;
        this.sickUsed = sickUsed;
        this.sickAvailable = sickAvailable;
        this.wfhQuota = wfhQuota;
        this.wfhUsed = wfhUsed;
        this.wfhAvailable = wfhAvailable;
        this.unpaidUsed = unpaidUsed;
        this.pendingDays = pendingDays;
        this.approvedDays = approvedDays;
    }

    public int getYear() {
        return year;
    }

    public void setYear(int year) {
        this.year = year;
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

    public long getWfhQuota() {
        return wfhQuota;
    }

    public void setWfhQuota(long wfhQuota) {
        this.wfhQuota = wfhQuota;
    }

    public long getWfhUsed() {
        return wfhUsed;
    }

    public void setWfhUsed(long wfhUsed) {
        this.wfhUsed = wfhUsed;
    }

    public long getWfhAvailable() {
        return wfhAvailable;
    }

    public void setWfhAvailable(long wfhAvailable) {
        this.wfhAvailable = wfhAvailable;
    }

    public long getUnpaidUsed() {
        return unpaidUsed;
    }

    public void setUnpaidUsed(long unpaidUsed) {
        this.unpaidUsed = unpaidUsed;
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

    // Compatibility aliases
    public long getCasualQuota() {
        return 0;
    }

    public long getCasualUsed() {
        return 0;
    }

    public long getCasualAvailable() {
        return 0;
    }
}
