package com.taskflow.message.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public class MessageDto {

    public static class SendMessageRequest {
        @NotBlank(message = "Message content cannot be blank")
        private String content;

        private String channel = "GENERAL";

        @JsonProperty("isClientVisible")
        @JsonAlias({"clientVisible", "is_client_visible"})
        private Boolean isClientVisible = true;

        public SendMessageRequest() {}

        public SendMessageRequest(String content, String channel, Boolean isClientVisible) {
            this.content = content;
            this.channel = channel;
            this.isClientVisible = isClientVisible != null ? isClientVisible : true;
        }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public String getChannel() { return channel; }
        public void setChannel(String channel) { this.channel = channel; }

        @JsonProperty("isClientVisible")
        public Boolean getIsClientVisible() { return isClientVisible; }

        @JsonProperty("isClientVisible")
        @JsonAlias({"clientVisible", "is_client_visible"})
        public void setIsClientVisible(Boolean isClientVisible) {
            this.isClientVisible = isClientVisible;
        }

        public boolean isClientVisible() {
            return isClientVisible != null ? isClientVisible : true;
        }
    }

    public static class MessageResponse {
        private Long messageId;
        private Long projectId;
        private String projectCode;
        private String channel;
        private String content;

        @JsonProperty("isClientVisible")
        private boolean isClientVisible;

        private Long senderId;
        private String senderName;
        private String senderRole;
        private Instant createdAt;

        public MessageResponse() {}

        public MessageResponse(Long messageId, Long projectId, String projectCode, String channel,
                               String content, boolean isClientVisible, Long senderId,
                               String senderName, String senderRole, Instant createdAt) {
            this.messageId = messageId;
            this.projectId = projectId;
            this.projectCode = projectCode;
            this.channel = channel;
            this.content = content;
            this.isClientVisible = isClientVisible;
            this.senderId = senderId;
            this.senderName = senderName;
            this.senderRole = senderRole;
            this.createdAt = createdAt;
        }

        public Long getMessageId() { return messageId; }
        public void setMessageId(Long messageId) { this.messageId = messageId; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getChannel() { return channel; }
        public void setChannel(String channel) { this.channel = channel; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        @JsonProperty("isClientVisible")
        public boolean isClientVisible() { return isClientVisible; }

        @JsonProperty("isClientVisible")
        public void setClientVisible(boolean clientVisible) { this.isClientVisible = clientVisible; }

        public Long getSenderId() { return senderId; }
        public void setSenderId(Long senderId) { this.senderId = senderId; }
        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }
        public String getSenderRole() { return senderRole; }
        public void setSenderRole(String senderRole) { this.senderRole = senderRole; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }
}
