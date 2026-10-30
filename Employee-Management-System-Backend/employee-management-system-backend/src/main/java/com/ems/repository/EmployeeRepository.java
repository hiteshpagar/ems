package com.ems.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.ems.entity.Employee;

public interface EmployeeRepository
        extends JpaRepository<Employee, Long> {

    Employee findByEmail(
            String email
    );

    boolean existsByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCaseAndIdNot(String email, Long id);
    long countByDepartmentIgnoreCase(String department);
    long countByDesignationIgnoreCase(String designation);
    java.util.List<Employee> findByCompanyId(Long companyId);
    long countByCompanyId(Long companyId);
}
