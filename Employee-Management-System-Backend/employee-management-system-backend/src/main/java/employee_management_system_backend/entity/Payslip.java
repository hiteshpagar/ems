package employee_management_system_backend.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;

@Entity
@Table(name = "payslips", uniqueConstraints = @UniqueConstraint(columnNames = {"employeeId", "payrollMonth"}))
public class Payslip {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private String department;
    private String designation;
    private String payrollMonth;
    private Double basicSalary;
    private Double totalAllowances;
    private Double grossSalary;
    private Double providentFund;
    private Double professionalTax;
    private Double incomeTax;
    private Double otherDeductions;
    private Double absenceDeduction;
    private Double totalDeductions;
    private Double netSalary;
    private Integer unpaidDays;
    private LocalDateTime generatedAt;

    public Long getId() { return id; } public void setId(Long v) { id = v; }
    public Long getEmployeeId() { return employeeId; } public void setEmployeeId(Long v) { employeeId = v; }
    public String getEmployeeName() { return employeeName; } public void setEmployeeName(String v) { employeeName = v; }
    public String getEmployeeEmail() { return employeeEmail; } public void setEmployeeEmail(String v) { employeeEmail = v; }
    public String getDepartment() { return department; } public void setDepartment(String v) { department = v; }
    public String getDesignation() { return designation; } public void setDesignation(String v) { designation = v; }
    public String getPayrollMonth() { return payrollMonth; } public void setPayrollMonth(String v) { payrollMonth = v; }
    public Double getBasicSalary() { return basicSalary; } public void setBasicSalary(Double v) { basicSalary = v; }
    public Double getTotalAllowances() { return totalAllowances; } public void setTotalAllowances(Double v) { totalAllowances = v; }
    public Double getGrossSalary() { return grossSalary; } public void setGrossSalary(Double v) { grossSalary = v; }
    public Double getProvidentFund() { return providentFund; } public void setProvidentFund(Double v) { providentFund = v; }
    public Double getProfessionalTax() { return professionalTax; } public void setProfessionalTax(Double v) { professionalTax = v; }
    public Double getIncomeTax() { return incomeTax; } public void setIncomeTax(Double v) { incomeTax = v; }
    public Double getOtherDeductions() { return otherDeductions; } public void setOtherDeductions(Double v) { otherDeductions = v; }
    public Double getAbsenceDeduction() { return absenceDeduction; } public void setAbsenceDeduction(Double v) { absenceDeduction = v; }
    public Double getTotalDeductions() { return totalDeductions; } public void setTotalDeductions(Double v) { totalDeductions = v; }
    public Double getNetSalary() { return netSalary; } public void setNetSalary(Double v) { netSalary = v; }
    public Integer getUnpaidDays() { return unpaidDays; } public void setUnpaidDays(Integer v) { unpaidDays = v; }
    public LocalDateTime getGeneratedAt() { return generatedAt; } public void setGeneratedAt(LocalDateTime v) { generatedAt = v; }
}
