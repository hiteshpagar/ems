package employee_management_system_backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import employee_management_system_backend.dto.DepartmentRequest;
import employee_management_system_backend.dto.DepartmentResponse;
import employee_management_system_backend.entity.Department;
import employee_management_system_backend.exception.ResourceAlreadyExistsException;
import employee_management_system_backend.exception.ResourceNotFoundException;
import employee_management_system_backend.repository.DepartmentRepository;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public DepartmentResponse createDepartment(DepartmentRequest request) {

        if (departmentRepository.existsByName(request.getName().trim())) {
        	throw new ResourceAlreadyExistsException(
        	        "Department already exists.");
        }

        Department department = new Department();
        department.setName(request.getName().trim());
        department.setDescription(request.getDescription());

        Department savedDepartment = departmentRepository.save(department);

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

        departmentRepository.findByName(requestedName)
                .filter(existingDepartment -> !existingDepartment.getId().equals(id))
                .ifPresent(existingDepartment -> {
                    throw new ResourceAlreadyExistsException(
                            "Department already exists.");
                });

        department.setName(requestedName);
        department.setDescription(request.getDescription());

        Department updatedDepartment = departmentRepository.save(department);

        return convertToResponse(updatedDepartment);
    }

    public void deleteDepartment(Long id) {

        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Department not found."));

        departmentRepository.delete(department);
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
