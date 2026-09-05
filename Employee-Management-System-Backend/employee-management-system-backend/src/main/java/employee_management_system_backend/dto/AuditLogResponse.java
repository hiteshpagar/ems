package employee_management_system_backend.dto;

import java.time.LocalDateTime;
import employee_management_system_backend.entity.AuditAction;
import employee_management_system_backend.entity.AuditLog;
import employee_management_system_backend.entity.AuditModule;

public class AuditLogResponse {

    private Long id;
    private Long userId;
    private String performedBy;
    private String performedByEmail;
    private String performedByRole;
    private AuditAction action;
    private AuditModule module;
    private String entityId;
    private String description;
    private String ipAddress;
    private LocalDateTime createdAt;

    public AuditLogResponse() {
    }

    public AuditLogResponse(Long id, Long userId, String performedBy, String performedByEmail,
                            String performedByRole, AuditAction action, AuditModule module,
                            String entityId, String description, String ipAddress,
                            LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.performedBy = performedBy;
        this.performedByEmail = performedByEmail;
        this.performedByRole = performedByRole;
        this.action = action;
        this.module = module;
        this.entityId = entityId;
        this.description = description;
        this.ipAddress = ipAddress;
        this.createdAt = createdAt;
    }

    public static AuditLogResponse from(AuditLog log) {
        if (log == null) {
            return null;
        }
        return new AuditLogResponse(
                log.getId(),
                log.getUserId(),
                log.getPerformedBy(),
                log.getPerformedByEmail(),
                log.getPerformedByRole(),
                log.getAction(),
                log.getModule(),
                log.getEntityId(),
                log.getDescription(),
                log.getIpAddress(),
                log.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getPerformedBy() {
        return performedBy;
    }

    public void setPerformedBy(String performedBy) {
        this.performedBy = performedBy;
    }

    public String getPerformedByEmail() {
        return performedByEmail;
    }

    public void setPerformedByEmail(String performedByEmail) {
        this.performedByEmail = performedByEmail;
    }

    public String getPerformedByRole() {
        return performedByRole;
    }

    public void setPerformedByRole(String performedByRole) {
        this.performedByRole = performedByRole;
    }

    public AuditAction getAction() {
        return action;
    }

    public void setAction(AuditAction action) {
        this.action = action;
    }

    public AuditModule getModule() {
        return module;
    }

    public void setModule(AuditModule module) {
        this.module = module;
    }

    public String getEntityId() {
        return entityId;
    }

    public void setEntityId(String entityId) {
        this.entityId = entityId;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
