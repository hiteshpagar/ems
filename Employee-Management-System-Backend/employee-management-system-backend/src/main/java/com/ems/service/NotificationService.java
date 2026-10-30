package com.ems.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ems.dto.NotificationResponse;
import com.ems.entity.Notification;
import com.ems.entity.NotificationType;
import com.ems.entity.User;
import com.ems.exception.ResourceNotFoundException;
import com.ems.repository.NotificationRepository;
import com.ems.repository.UserRepository;

@Service
public class NotificationService {
    private final NotificationRepository notifications;
    private final UserRepository users;

    public NotificationService(NotificationRepository notifications, UserRepository users) {
        this.notifications = notifications;
        this.users = users;
    }

    @Transactional
    public void createForUser(User recipient, String title, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notifications.save(notification);
    }

    @Transactional
    public void createForEmail(String email, String title, String message, NotificationType type) {
        User user = users.findByEmail(email);
        if (user != null) createForUser(user, title, message, type);
    }

    @Transactional
    public void createForAdministrators(String title, String message, NotificationType type) {
        users.findByRole("ADMIN").forEach(user -> createForUser(user, title, message, type));
    }

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getCurrentUserNotifications(String email, int page, int size) {
        User user = getUser(email);
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), 100);
        return notifications.findByRecipientId(user.getId(), PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(NotificationResponse::from);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        return notifications.countByRecipientIdAndReadFalse(getUser(email).getId());
    }

    @Transactional
    public NotificationResponse markRead(String email, Long id) {
        Notification notification = getOwnedNotification(email, id);
        notification.setRead(true);
        return NotificationResponse.from(notifications.save(notification));
    }

    @Transactional
    public void markAllRead(String email) {
        Long userId = getUser(email).getId();
        notifications.markAllReadByRecipientId(userId);
    }

    @Transactional
    public void delete(String email, Long id) {
        notifications.delete(getOwnedNotification(email, id));
    }

    private User getUser(String email) {
        User user = users.findByEmail(email);
        if (user == null) throw new ResourceNotFoundException("Authenticated user not found.");
        return user;
    }

    private Notification getOwnedNotification(String email, Long id) {
        return notifications.findByIdAndRecipientId(id, getUser(email).getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found."));
    }
}
