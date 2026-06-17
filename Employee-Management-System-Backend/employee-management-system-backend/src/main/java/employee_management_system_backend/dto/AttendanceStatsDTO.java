package employee_management_system_backend.dto;

public class AttendanceStatsDTO {

    private long presentToday;

    private long absentToday;

    private long checkedInToday;

    public AttendanceStatsDTO(
            long presentToday,
            long absentToday,
            long checkedInToday
    ) {
        this.presentToday = presentToday;
        this.absentToday = absentToday;
        this.checkedInToday = checkedInToday;
    }

    public long getPresentToday() {
        return presentToday;
    }

    public long getAbsentToday() {
        return absentToday;
    }

    public long getCheckedInToday() {
        return checkedInToday;
    }
}