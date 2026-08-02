package employee_management_system_backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "salary_structures", uniqueConstraints = @UniqueConstraint(columnNames = "employeeId"))
public class SalaryStructure {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long employeeId;
    private Double basicSalary = 0.0;
    private Double houseRentAllowance = 0.0;
    private Double transportAllowance = 0.0;
    private Double otherAllowance = 0.0;
    private Double providentFund = 0.0;
    private Double professionalTax = 0.0;
    private Double incomeTax = 0.0;
    private Double otherDeductions = 0.0;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getEmployeeId() { return employeeId; }
    public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
    public Double getBasicSalary() { return basicSalary; }
    public void setBasicSalary(Double value) { basicSalary = value; }
    public Double getHouseRentAllowance() { return houseRentAllowance; }
    public void setHouseRentAllowance(Double value) { houseRentAllowance = value; }
    public Double getTransportAllowance() { return transportAllowance; }
    public void setTransportAllowance(Double value) { transportAllowance = value; }
    public Double getOtherAllowance() { return otherAllowance; }
    public void setOtherAllowance(Double value) { otherAllowance = value; }
    public Double getProvidentFund() { return providentFund; }
    public void setProvidentFund(Double value) { providentFund = value; }
    public Double getProfessionalTax() { return professionalTax; }
    public void setProfessionalTax(Double value) { professionalTax = value; }
    public Double getIncomeTax() { return incomeTax; }
    public void setIncomeTax(Double value) { incomeTax = value; }
    public Double getOtherDeductions() { return otherDeductions; }
    public void setOtherDeductions(Double value) { otherDeductions = value; }
}
