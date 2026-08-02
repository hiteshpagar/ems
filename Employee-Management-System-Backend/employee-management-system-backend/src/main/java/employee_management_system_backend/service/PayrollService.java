package employee_management_system_backend.service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import org.springframework.stereotype.Service;
import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.entity.Payslip;
import employee_management_system_backend.entity.SalaryStructure;
import employee_management_system_backend.repository.AttendanceRepository;
import employee_management_system_backend.repository.EmployeeRepository;
import employee_management_system_backend.repository.PayslipRepository;
import employee_management_system_backend.repository.SalaryStructureRepository;
import employee_management_system_backend.exception.ResourceAlreadyExistsException;
import jakarta.transaction.Transactional;

@Service
public class PayrollService {
    private final SalaryStructureRepository salaryStructures;
    private final PayslipRepository payslips;
    private final EmployeeRepository employees;
    private final AttendanceRepository attendance;

    public PayrollService(SalaryStructureRepository salaryStructures, PayslipRepository payslips,
            EmployeeRepository employees, AttendanceRepository attendance) {
        this.salaryStructures = salaryStructures; this.payslips = payslips;
        this.employees = employees; this.attendance = attendance;
    }

    public SalaryStructure saveStructure(SalaryStructure structure) {
        if (structure.getEmployeeId() == null || !employees.existsById(structure.getEmployeeId()))
            throw new IllegalArgumentException("A valid employee is required");
        validateStructure(structure);
        SalaryStructure existing = salaryStructures.findByEmployeeId(structure.getEmployeeId()).orElse(null);
        if (existing != null) structure.setId(existing.getId());
        SalaryStructure savedStructure = salaryStructures.save(structure);

        // The employee's salary and the structure's basic salary represent the
        // same monthly-basic-pay value, regardless of which admin screen edits it.
        Employee employee = employees.findById(structure.getEmployeeId()).orElseThrow();
        employee.setSalary(amount(savedStructure.getBasicSalary()));
        employees.save(employee);

        return savedStructure;
    }
    public List<SalaryStructure> getStructures() { return salaryStructures.findAll(); }
    public SalaryStructure getStructure(Long employeeId) { return salaryStructures.findByEmployeeId(employeeId).orElse(null); }
    public List<Payslip> getPayslips() { return payslips.findAllByOrderByPayrollMonthDescEmployeeNameAsc(); }
    public List<Payslip> getEmployeePayslips(Long employeeId) { return payslips.findByEmployeeIdOrderByPayrollMonthDesc(employeeId); }

    @Transactional
    public List<Payslip> generate(String month) {
        YearMonth payMonth = YearMonth.parse(month);
        if (payMonth.isAfter(YearMonth.now())) throw new IllegalArgumentException("Payroll cannot be generated for a future month.");
        if (payslips.existsByPayrollMonth(month)) throw new ResourceAlreadyExistsException("Payroll has already been generated for this month.");
        return employees.findAll().stream().map(employee -> createPayslip(employee, payMonth)).toList();
    }
    private Payslip createPayslip(Employee employee, YearMonth month) {
        SalaryStructure structure = salaryStructures.findByEmployeeId(employee.getId()).orElseGet(() -> defaultStructure(employee));
        double basic = amount(structure.getBasicSalary());
        double allowances = amount(structure.getHouseRentAllowance()) + amount(structure.getTransportAllowance()) + amount(structure.getOtherAllowance());
        double gross = basic + allowances;
        int absentDays = attendance.countByEmployeeIdAndDateStartingWithAndStatusIgnoreCase(employee.getId(), month.toString(), "Absent");
        double absenceDeduction = gross / month.lengthOfMonth() * absentDays;
        double deductions = amount(structure.getProvidentFund()) + amount(structure.getProfessionalTax()) + amount(structure.getIncomeTax()) + amount(structure.getOtherDeductions()) + absenceDeduction;
        Payslip slip = payslips.findByEmployeeIdAndPayrollMonth(employee.getId(), month.toString()).orElse(new Payslip());
        slip.setEmployeeId(employee.getId()); slip.setEmployeeName(employee.getName()); slip.setEmployeeEmail(employee.getEmail());
        slip.setDepartment(employee.getDepartment()); slip.setDesignation(employee.getDesignation()); slip.setPayrollMonth(month.toString());
        slip.setBasicSalary(round(basic)); slip.setTotalAllowances(round(allowances)); slip.setGrossSalary(round(gross));
        slip.setProvidentFund(round(amount(structure.getProvidentFund()))); slip.setProfessionalTax(round(amount(structure.getProfessionalTax())));
        slip.setIncomeTax(round(amount(structure.getIncomeTax()))); slip.setOtherDeductions(round(amount(structure.getOtherDeductions())));
        slip.setAbsenceDeduction(round(absenceDeduction)); slip.setTotalDeductions(round(deductions)); slip.setNetSalary(round(Math.max(0, gross - deductions)));
        slip.setUnpaidDays(absentDays); slip.setGeneratedAt(LocalDateTime.now());
        return payslips.save(slip);
    }
    private SalaryStructure defaultStructure(Employee employee) { SalaryStructure s = new SalaryStructure(); s.setEmployeeId(employee.getId()); s.setBasicSalary(amount(employee.getSalary())); return s; }
    private double amount(Double value) { return value == null ? 0 : value; }
    private double round(double value) { return Math.round(value * 100.0) / 100.0; }
    private void validateStructure(SalaryStructure structure) {
        if (amount(structure.getBasicSalary()) < 0 || amount(structure.getHouseRentAllowance()) < 0
                || amount(structure.getTransportAllowance()) < 0 || amount(structure.getOtherAllowance()) < 0
                || amount(structure.getProvidentFund()) < 0 || amount(structure.getProfessionalTax()) < 0
                || amount(structure.getIncomeTax()) < 0 || amount(structure.getOtherDeductions()) < 0) {
            throw new IllegalArgumentException("Salary components and deductions cannot be negative.");
        }
    }
}
