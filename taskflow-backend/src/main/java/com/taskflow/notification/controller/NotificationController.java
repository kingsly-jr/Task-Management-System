package com.taskflow.notification.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.notification.dto.NotificationDto;
import com.taskflow.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notification Center", description = "Endpoints for user in-app notifications, unread counts, and reading status")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get notifications for current authenticated user")
    public ResponseEntity<ApiResponse<NotificationDto.NotificationSummaryResponse>> getMyNotifications() {
        NotificationDto.NotificationSummaryResponse response = notificationService.getMyNotifications();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get fast unread notifications count for header badge")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(ApiResponse.ok(count));
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark specific notification as read")
    public ResponseEntity<ApiResponse<NotificationDto.NotificationResponse>> markAsRead(@PathVariable Long id) {
        NotificationDto.NotificationResponse response = notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", response));
    }

    @PatchMapping("/mark-all-read")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Mark all notifications as read for current user")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }
}
