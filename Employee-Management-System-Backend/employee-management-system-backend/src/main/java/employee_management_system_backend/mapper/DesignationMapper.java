package employee_management_system_backend.mapper;

import org.springframework.stereotype.Component;

import employee_management_system_backend.dto.DesignationResponse;
import employee_management_system_backend.entity.Designation;

@Component
public class DesignationMapper {

    public DesignationResponse mapToResponse(Designation designation) {

        DesignationResponse response = new DesignationResponse();

        response.setId(designation.getId());
        response.setName(designation.getName());
        response.setDescription(designation.getDescription());

        response.setDepartmentId(designation.getDepartment().getId());
        response.setDepartmentName(designation.getDepartment().getName());

        response.setCreatedAt(designation.getCreatedAt());
        response.setUpdatedAt(designation.getUpdatedAt());

        return response;
    }
}