package com.ems.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import com.ems.dto.DesignationRequest;
import com.ems.dto.DesignationResponse;
import com.ems.entity.AuditAction;
import com.ems.entity.AuditModule;
import com.ems.entity.Department;
import com.ems.entity.Designation;
import com.ems.exception.ResourceAlreadyExistsException;
import com.ems.exception.ResourceNotFoundException;
import com.ems.mapper.DesignationMapper;
import com.ems.repository.DepartmentRepository;
import com.ems.repository.DesignationRepository;
import com.ems.repository.EmployeeRepository;

@Service
public class DesignationService {

    private final DesignationRepository designationRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationMapper designationMapper;
    private final EmployeeRepository employeeRepository;
    private final AuditLogService auditLogService;

    public DesignationService(
            DesignationRepository designationRepository,
            DepartmentRepository departmentRepository,
            DesignationMapper designationMapper,
            EmployeeRepository employeeRepository,
            AuditLogService auditLogService) {

        this.designationRepository = designationRepository;
        this.departmentRepository = departmentRepository;
        this.designationMapper = designationMapper;
        this.employeeRepository = employeeRepository;
        this.auditLogService = auditLogService;
    }

    // ADD THIS METHOD
    public DesignationResponse createDesignation(DesignationRequest request) {

        Department department = departmentRepository
                .findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found."));

        if (designationRepository.existsByNameIgnoreCaseAndDepartmentId(
                request.getName().trim(),
                department.getId())) {

            throw new ResourceAlreadyExistsException("Designation already exists.");
        }

        Designation designation = new Designation();

        designation.setName(request.getName().trim());
        designation.setDescription(request.getDescription());
        designation.setDepartment(department);

        Designation savedDesignation = designationRepository.save(designation);

        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.DESIGNATION,
                savedDesignation.getId() != null ? savedDesignation.getId().toString() : null,
                "Created designation " + savedDesignation.getName() + " in department " + department.getName()
        );

        return designationMapper.mapToResponse(savedDesignation);
    }
    
    public List<DesignationResponse> getAllDesignations() {

        List<Designation> designations = designationRepository.findAll();

        return designations.stream()
                .map(designationMapper::mapToResponse)
                .collect(Collectors.toList());
    }
    
    public DesignationResponse getDesignationById(Long id) {

        Designation designation = designationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Designation not found."));

        return designationMapper.mapToResponse(designation);
    }
    
    public DesignationResponse updateDesignation(Long id, DesignationRequest request) {

        // Find existing designation
        Designation designation = designationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Designation not found."));

        // Find department
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Department not found."));

        // Check duplicate (excluding current designation)
        if (designationRepository.existsByNameIgnoreCaseAndDepartmentIdAndIdNot(
                request.getName().trim(),
                department.getId(),
                id)) {

            throw new ResourceAlreadyExistsException("Designation already exists.");
        }

        // Update fields
        designation.setName(request.getName().trim());
        designation.setDescription(request.getDescription());
        designation.setDepartment(department);

        // Save updated designation
        Designation updatedDesignation = designationRepository.save(designation);

        auditLogService.log(
                AuditAction.UPDATE,
                AuditModule.DESIGNATION,
                updatedDesignation.getId().toString(),
                "Updated designation " + updatedDesignation.getName()
        );

        return designationMapper.mapToResponse(updatedDesignation);
    }
    
    public void deleteDesignation(Long id) {

        // Find designation
        Designation designation = designationRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Designation not found."));

        if (employeeRepository.countByDesignationIgnoreCase(designation.getName()) > 0) {
            throw new IllegalStateException("This designation is assigned to employees and cannot be deleted.");
        }

        String designationName = designation.getName();
        designationRepository.delete(designation);

        auditLogService.log(
                AuditAction.DELETE,
                AuditModule.DESIGNATION,
                id.toString(),
                "Deleted designation " + designationName + " (ID: " + id + ")"
        );
    }
}
