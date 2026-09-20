package com.taskflow.notification.service;

import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
import com.taskflow.notification.dto.NotificationDto;
import com.taskflow.notification.entity.Notification;
import com.taskflow.notification.repository.NotificationRepository;
import com.taskflow.security.UserPrincipal;
import com.taskflow.user.entity.User;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @Transactional
    public Notification createNotification(User recipient, User sender, String title, String message, String type, String targetUrl) {
        Notification notification = Notification.builder()
                .recipient(recipient)
                .sender(sender)
                .title(title)
                .message(message)
                .type(type != null ? type : "GENERAL")
                .targetUrl(targetUrl)
                .isRead(false)
                .build();

        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public NotificationDto.NotificationSummaryResponse getMyNotifications() {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        List<Notification> list = notificationRepository.findByRecipient_UserIdOrderByCreatedAtDesc(currentUser.getId());
        long unreadCount = notificationRepository.countByRecipient_UserIdAndIsReadFalse(currentUser.getId());

        List<NotificationDto.NotificationResponse> dtos = list.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return new NotificationDto.NotificationSummaryResponse(unreadCount, dtos);
    }

    @Transactional(readOnly = true)
    public long getUnreadCount() {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        return notificationRepository.countByRecipient_UserIdAndIsReadFalse(currentUser.getId());
    }

    @Transactional
    public NotificationDto.NotificationResponse markAsRead(Long notificationId) {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getRecipient().getUserId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You do not own this notification");
        }

        notification.setRead(true);
        Notification updated = notificationRepository.save(notification);
        return mapToDto(updated);
    }

    @Transactional
    public void markAllAsRead() {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        notificationRepository.markAllAsReadByRecipientId(currentUser.getId());
    }

    private UserPrincipal getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User not authenticated");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    private NotificationDto.NotificationResponse mapToDto(Notification n) {
        return new NotificationDto.NotificationResponse(
                n.getNotificationId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getTargetUrl(),
                n.isRead(),
                n.getCreatedAt(),
                n.getSender() != null ? n.getSender().getUserId() : null,
                n.getSender() != null ? (n.getSender().getFirstName() + " " + n.getSender().getLastName()) : "TaskFlow System"
        );
    }
}
