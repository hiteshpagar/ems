package employee_management_system_backend.dto;

import java.time.LocalDateTime;

public class HrDTO {
    private Long id;
    private String fullName;
    private String email;
    private String role = "HR";
    private Boolean active = true;
    private Long companyId;
    private String companyName;
    private String designation;
    private String phoneNumber;
    private String employeeId;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private Boolean passwordChangeRequired = false;

    public HrDTO() {}

    public HrDTO(Long id, String fullName, String email, String role, Boolean active,
                 Long companyId, String companyName, String designation,
                 String phoneNumber, String employeeId,
                 LocalDateTime createdAt, LocalDateTime lastLoginAt,
                 Boolean passwordChangeRequired) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role != null ? role : "HR";
        this.active = active != null ? active : true;
        this.companyId = companyId;
        this.companyName = companyName;
        this.designation = designation;
        this.phoneNumber = phoneNumber;
        this.employeeId = employeeId;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
        this.passwordChangeRequired = passwordChangeRequired != null ? passwordChangeRequired : false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Long getCompanyId() {
        return companyId;
    }

    public void setCompanyId(Long companyId) {
        this.companyId = companyId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(String employeeId) {
        this.employeeId = employeeId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public Boolean getPasswordChangeRequired() {
        return passwordChangeRequired;
    }

    public void setPasswordChangeRequired(Boolean passwordChangeRequired) {
        this.passwordChangeRequired = passwordChangeRequired;
    }
}
