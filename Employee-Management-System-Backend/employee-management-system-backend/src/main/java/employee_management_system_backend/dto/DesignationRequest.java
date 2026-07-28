package employee_management_system_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class DesignationRequest {

	@NotBlank(message = "Designation name is required.")
	@Size(max = 100, message = "Designation name cannot exceed 100 characters.")
	private String name;

	@Size(max = 255, message = "Description cannot exceed 255 characters.")
	private String description;

	@NotNull(message = "Department is required.")
	private Long departmentId;

    public DesignationRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }
}