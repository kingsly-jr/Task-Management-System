package com.taskflow.notification.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class NotificationDto {

    public static class NotificationResponse {
        private UUID notificationId;
        private String title;
        private String message;
        private String type;
        private String targetUrl;

        @JsonProperty("isRead")
        private boolean isRead;

        private Instant createdAt;
        private UUID senderId;
        private String senderName;

        public NotificationResponse() {}

        public NotificationResponse(UUID notificationId, String title, String message, String type,
                                    String targetUrl, boolean isRead, Instant createdAt,
                                    UUID senderId, String senderName) {
            this.notificationId = notificationId;
            this.title = title;
            this.message = message;
            this.type = type;
            this.targetUrl = targetUrl;
            this.isRead = isRead;
            this.createdAt = createdAt;
            this.senderId = senderId;
            this.senderName = senderName;
        }

        public UUID getNotificationId() { return notificationId; }
        public void setNotificationId(UUID notificationId) { this.notificationId = notificationId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        public String getTargetUrl() { return targetUrl; }
        public void setTargetUrl(String targetUrl) { this.targetUrl = targetUrl; }
        @JsonProperty("isRead")
        public boolean isRead() { return isRead; }
        @JsonProperty("isRead")
        public boolean getIsRead() { return isRead; }
        @JsonProperty("isRead")
        public void setRead(boolean read) { isRead = read; }
        @JsonProperty("isRead")
        public void setIsRead(boolean read) { isRead = read; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public UUID getSenderId() { return senderId; }
        public void setSenderId(UUID senderId) { this.senderId = senderId; }
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
    }

    public static class NotificationSummaryResponse {
        private long unreadCount;
        private List<NotificationResponse> notifications = new ArrayList<>();

        public NotificationSummaryResponse() {}

        public NotificationSummaryResponse(long unreadCount, List<NotificationResponse> notifications) {
            this.unreadCount = unreadCount;
            this.notifications = notifications != null ? notifications : new ArrayList<>();
        }

        public long getUnreadCount() { return unreadCount; }
        public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }
        public List<NotificationResponse> getNotifications() { return notifications; }
        public void setNotifications(List<NotificationResponse> notifications) { this.notifications = notifications; }
    }
}
