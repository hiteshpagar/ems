package employee_management_system_backend.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class HolidayRequest {

    @NotBlank(message = "Holiday name is required.")
    @Size(max = 100, message = "Holiday name cannot exceed 100 characters.")
    private String name;

    @NotNull(message = "Holiday date is required.")
    private LocalDate holidayDate;

    @NotBlank(message = "Holiday type is required.")
    @Size(max = 50, message = "Holiday type cannot exceed 50 characters.")
    private String type;

    @Size(max = 255, message = "Description cannot exceed 255 characters.")
    private String description;

    public HolidayRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public LocalDate getHolidayDate() {
        return holidayDate;
    }

    public void setHolidayDate(LocalDate holidayDate) {
        this.holidayDate = holidayDate;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
