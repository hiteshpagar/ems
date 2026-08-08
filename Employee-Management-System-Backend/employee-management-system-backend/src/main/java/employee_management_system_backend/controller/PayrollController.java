package employee_management_system_backend.controller;

import java.time.YearMonth;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import employee_management_system_backend.entity.Employee;
import employee_management_system_backend.entity.Payslip;
import employee_management_system_backend.entity.SalaryStructure;
import employee_management_system_backend.service.EmployeeService;
import employee_management_system_backend.service.PayrollService;

@RestController
@RequestMapping("/api/payroll")
public class PayrollController {
    private final PayrollService payroll; private final EmployeeService employees;
    public PayrollController(PayrollService payroll, EmployeeService employees) { this.payroll = payroll; this.employees = employees; }
    @GetMapping("/salary-structures") public List<SalaryStructure> structures() { return payroll.getStructures(); }
    @GetMapping("/salary-structures/{employeeId}") public SalaryStructure structure(@PathVariable Long employeeId) { return payroll.getStructure(employeeId); }
    @PostMapping("/salary-structures") @ResponseStatus(HttpStatus.CREATED) public SalaryStructure saveStructure(@RequestBody SalaryStructure structure) { return payroll.saveStructure(structure); }
    @PostMapping("/generate") public List<Payslip> generate(@RequestParam String month) { YearMonth.parse(month); return payroll.generate(month); }
    @GetMapping("/payslips") public List<Payslip> payslips() { return payroll.getPayslips(); }
    @GetMapping("/payslips/me") public List<Payslip> myPayslips(Authentication auth) { Employee employee = employees.getEmployeeByEmail(auth.getName()); return employee == null ? List.of() : payroll.getEmployeePayslips(employee.getId()); }
}
