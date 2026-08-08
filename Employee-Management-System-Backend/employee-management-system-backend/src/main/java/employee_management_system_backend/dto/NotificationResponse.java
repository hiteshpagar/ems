package employee_management_system_backend.dto;

import java.time.LocalDateTime;

import employee_management_system_backend.entity.Notification;
import employee_management_system_backend.entity.NotificationType;

public record NotificationResponse(Long id, String title, String message, NotificationType type,
        boolean read, LocalDateTime createdAt, LocalDateTime updatedAt) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(notification.getId(), notification.getTitle(), notification.getMessage(),
                notification.getType(), notification.isRead(), notification.getCreatedAt(), notification.getUpdatedAt());
    }
}
