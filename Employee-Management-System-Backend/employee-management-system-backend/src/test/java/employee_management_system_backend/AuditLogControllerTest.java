package employee_management_system_backend;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import employee_management_system_backend.controller.AuditLogController;
import employee_management_system_backend.dto.AuditLogResponse;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.service.AuditLogService;

@ExtendWith(MockitoExtension.class)
public class AuditLogControllerTest {

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private AuditLogController auditLogController;

    @Test
    void testGetAuditLogs() {
        AuditLogResponse log = new AuditLogResponse(
                1L, 1L, "Admin User", "admin@ems.com", "ADMIN",
                AuditAction.CREATE, AuditModule.EMPLOYEE, "10",
                "Created employee John Doe", "127.0.0.1", LocalDateTime.now()
        );

        Page<AuditLogResponse> page = new PageImpl<>(List.of(log));
        when(auditLogService.getAuditLogs(anyInt(), anyInt(), any(), any(), any(), any(), any(), any()))
                .thenReturn(page);

        ResponseEntity<Page<AuditLogResponse>> response = auditLogController.getAuditLogs(
                0, 20, AuditModule.EMPLOYEE, AuditAction.CREATE, 1L, "John", null, null
        );

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().getTotalElements());
        assertEquals("Created employee John Doe", response.getBody().getContent().get(0).getDescription());
    }

    @Test
    void testGetAuditLogById() {
        AuditLogResponse log = new AuditLogResponse(
                5L, 2L, "Jane Doe", "jane@ems.com", "EMPLOYEE",
                AuditAction.CREATE, AuditModule.LEAVE, "12",
                "Applied for Sick leave", "127.0.0.1", LocalDateTime.now()
        );

        when(auditLogService.getAuditLogById(5L)).thenReturn(log);

        ResponseEntity<AuditLogResponse> response = auditLogController.getAuditLogById(5L);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(5L, response.getBody().getId());
        assertEquals(AuditModule.LEAVE, response.getBody().getModule());
        assertEquals("Applied for Sick leave", response.getBody().getDescription());
    }
}
