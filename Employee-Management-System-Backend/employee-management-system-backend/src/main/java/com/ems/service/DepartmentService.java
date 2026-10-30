package com.ems.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.ems.dto.DepartmentRequest;
import com.ems.dto.DepartmentResponse;
import com.ems.entity.AuditAction;
import com.ems.entity.AuditModule;
import com.ems.entity.Department;
import com.ems.exception.ResourceAlreadyExistsException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.DesignationRepository;
import com.ems.repository.EmployeeRepository;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    public DepartmentService(DepartmentRepository departmentRepository,
            DesignationRepository designationRepository, EmployeeRepository employeeRepository,
            AuditLogService auditLogService) {
        this.departmentRepository = departmentRepository;
        this.designationRepository = designationRepository;
        this.employeeRepository = employeeRepository;
        this.auditLogService = auditLogService;
    }

    public DepartmentResponse createDepartment(DepartmentRequest request) {

        if (departmentRepository.existsByNameIgnoreCase(request.getName().trim())) {
        	throw new ResourceAlreadyExistsException(
        	        "Department already exists.");
        }

        Department department = new Department();
        department.setName(request.getName().trim());
        department.setDescription(request.getDescription());

        Department savedDepartment = departmentRepository.save(department);

        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.DEPARTMENT,
                savedDepartment.getId() != null ? savedDepartment.getId().toString() : null,
                "Created department " + savedDepartment.getName()
        );

        return convertToResponse(savedDepartment);
    }

    public List<DepartmentResponse> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    public DepartmentResponse getDepartmentById(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found."));

        return convertToResponse(department);
    }

    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found."));

        String requestedName = request.getName().trim();

        departmentRepository.findByNameIgnoreCase(requestedName)
                .filter(existingDepartment -> !existingDepartment.getId().equals(id))
                .ifPresent(existingDepartment -> {
                    throw new ResourceAlreadyExistsException(
                            "Department already exists.");
                });

        department.setName(requestedName);
        department.setDescription(request.getDescription());

        Department updatedDepartment = departmentRepository.save(department);

        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.DEPARTMENT,
                updatedDepartment.getId().toString(),
                "Updated department " + updatedDepartment.getName()
        );

        return convertToResponse(updatedDepartment);
    }

    public void deleteDepartment(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found."));

        if (designationRepository.countByDepartmentId(id) > 0
                || employeeRepository.countByDepartmentIgnoreCase(department.getName()) > 0) {
            throw new IllegalStateException("This department is assigned to employees or designations and cannot be deleted.");
        }
        String deptName = department.getName();
        departmentRepository.delete(department);

        auditLogService.log(
                AuditAction.DELETE,
                AuditModule.DEPARTMENT,
                id.toString(),
                "Deleted department " + deptName + " (ID: " + id + ")"
        );
    }

    private DepartmentResponse convertToResponse(Department department) {

        return new DepartmentResponse(
                department.getId(),
                department.getName(),
                department.getDescription(),
                department.getCreatedAt(),
                department.getUpdatedAt());
    }
}
