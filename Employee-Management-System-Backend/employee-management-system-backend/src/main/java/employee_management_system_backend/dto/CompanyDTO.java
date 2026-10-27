package employee_management_system_backend.dto;

import java.time.LocalDateTime;

public class CompanyDTO {
    private Long id;
    private String name;
    private String code;
    private String email;
    private String phone;
    private String address;
    private long totalAdmins;
    private long totalEmployees;
    private LocalDateTime createdAt;

    public CompanyDTO() {}

    public CompanyDTO(Long id, String name, String code, String email, String phone, String address, long totalAdmins, long totalEmployees, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.totalAdmins = totalAdmins;
        this.totalEmployees = totalEmployees;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
