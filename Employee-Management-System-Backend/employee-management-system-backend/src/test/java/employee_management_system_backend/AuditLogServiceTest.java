package employee_management_system_backend;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import employee_management_system_backend.dto.AuditLogResponse;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditLog;
import employee_management_system_backend.entity.AuditModule;
import employee_management_system_backend.entity.User;
import employee_management_system_backend.repository.AuditLogRepository;
import employee_management_system_backend.repository.UserRepository;
import employee_management_system_backend.service.AuditLogService;

@ExtendWith(MockitoExtension.class)
public class AuditLogServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private AuditLogService auditLogService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(1L);
        sampleUser.setEmail("admin@ems.com");
        sampleUser.setFullName("Admin User");
        sampleUser.setRole("ADMIN");
    }

    @Test
    void testLogWithExplicitUser() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(invocation -> invocation.getArgument(0));

        auditLogService.log(
                AuditAction.CREATE,
                AuditModule.EMPLOYEE,
                "10",
                "Created employee John Doe",
                sampleUser
        );

        verify(auditLogRepository, times(1)).save(argThat(log ->
                log.getAction() == AuditAction.CREATE &&
                log.getModule() == AuditModule.EMPLOYEE &&
                "10".equals(log.getEntityId()) &&
                "Admin User".equals(log.getPerformedBy()) &&
                "admin@ems.com".equals(log.getPerformedByEmail()) &&
                "ADMIN".equals(log.getPerformedByRole())
        ));
    }

    @Test
    void testGetAuditLogs() {
        AuditLog log = new AuditLog(1L, "Admin User", "admin@ems.com", "ADMIN",
                AuditAction.CREATE, AuditModule.DEPARTMENT, "5", "Created department Engineering", "127.0.0.1");
        log.setId(100L);

        Page<AuditLog> page = new PageImpl<>(List.of(log));
        when(auditLogRepository.findAll(any(Specification.class), any(Pageable.class))).thenReturn(page);

        Page<AuditLogResponse> responsePage = auditLogService.getAuditLogs(
                0, 10, AuditModule.DEPARTMENT, AuditAction.CREATE, null, null, null, null
        );

        assertNotNull(responsePage);
        assertEquals(1, responsePage.getTotalElements());
        AuditLogResponse response = responsePage.getContent().get(0);
        assertEquals(100L, response.getId());
        assertEquals("Created department Engineering", response.getDescription());
        assertEquals(AuditModule.DEPARTMENT, response.getModule());
        assertEquals(AuditAction.CREATE, response.getAction());
    }

    @Test
    void testGetAuditLogById() {
        AuditLog log = new AuditLog(1L, "Admin User", "admin@ems.com", "ADMIN",
                AuditAction.UPDATE, AuditModule.PAYROLL, "2", "Saved salary structure", "127.0.0.1");
        log.setId(50L);

        when(auditLogRepository.findById(50L)).thenReturn(Optional.of(log));

        AuditLogResponse response = auditLogService.getAuditLogById(50L);
        assertNotNull(response);
        assertEquals(50L, response.getId());
        assertEquals(AuditAction.UPDATE, response.getAction());
        assertEquals(AuditModule.PAYROLL, response.getModule());
    }
}
