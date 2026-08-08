package employee_management_system_backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import employee_management_system_backend.entity.Notification;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByRecipientId(Long recipientId, Pageable pageable);
    long countByRecipientIdAndReadFalse(Long recipientId);
    java.util.Optional<Notification> findByIdAndRecipientId(Long id, Long recipientId);

    @Modifying
    @Query("update Notification n set n.read = true, n.updatedAt = current_timestamp where n.recipient.id = :recipientId and n.read = false")
    int markAllReadByRecipientId(@Param("recipientId") Long recipientId);
}
