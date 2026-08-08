package employee_management_system_backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import employee_management_system_backend.dto.DesignationRequest;
import employee_management_system_backend.dto.DesignationResponse;
import employee_management_system_backend.service.DesignationService;

@RestController
@RequestMapping("/api/designations")
public class DesignationController {

    private final DesignationService designationService;

    public DesignationController(DesignationService designationService) {
        this.designationService = designationService;
    }

    // Create Designation
    @PostMapping
    public ResponseEntity<DesignationResponse> createDesignation(
    		@Valid @RequestBody DesignationRequest request) {

        DesignationResponse response = designationService.createDesignation(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    // Get All Designations
    @GetMapping
    public ResponseEntity<List<DesignationResponse>> getAllDesignations() {

        List<DesignationResponse> response = designationService.getAllDesignations();

        return ResponseEntity.ok(response);
    }

    // Get Designation By Id
    @GetMapping("/{id}")
    public ResponseEntity<DesignationResponse> getDesignationById(
            @PathVariable Long id) {

        DesignationResponse response = designationService.getDesignationById(id);

        return ResponseEntity.ok(response);
    }

    // Update Designation
    @PutMapping("/{id}")
    public ResponseEntity<DesignationResponse> updateDesignation(
            @PathVariable Long id,
            @Valid @RequestBody DesignationRequest request) {

        DesignationResponse response =
                designationService.updateDesignation(id, request);

        return ResponseEntity.ok(response);
    }

    // Delete Designation
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteDesignation(
            @PathVariable Long id) {

        designationService.deleteDesignation(id);

        return ResponseEntity.ok("Designation deleted successfully.");
    }
}