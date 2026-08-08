package employee_management_system_backend.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import employee_management_system_backend.dto.DesignationRequest;
import employee_management_system_backend.dto.DesignationResponse;
import employee_management_system_backend.entity.Department;
import employee_management_system_backend.entity.Designation;
import employee_management_system_backend.exception.ResourceAlreadyExistsException;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.mapper.DesignationMapper;
import employee_management_system_backend.repository.DepartmentRepository;
import employee_management_system_backend.repository.DesignationRepository;
import employee_management_system_backend.repository.EmployeeRepository;

@Service
public class DesignationService {

    private final DesignationRepository designationRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationMapper designationMapper;
    private final EmployeeRepository employeeRepository;

    public DesignationService(
            DesignationRepository designationRepository,
            DepartmentRepository departmentRepository,
            DesignationMapper designationMapper, EmployeeRepository employeeRepository) {

        this.designationRepository = designationRepository;
        this.departmentRepository = departmentRepository;
        this.designationMapper = designationMapper;
        this.employeeRepository = employeeRepository;
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

        designationRepository.delete(designation);
    }
}
