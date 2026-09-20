package com.taskflow.message.entity;

import com.taskflow.project.entity.Project;
import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_messages")
@EntityListeners(AuditingEntityListener.class)
public class ProjectMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "message_id", updatable = false, nullable = false)
    private UUID messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "channel", nullable = false, length = 50)
    private String channel = "GENERAL";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(name = "content", columnDefinition = "TEXT", nullable = false)
    private String content;

    @Column(name = "is_client_visible", nullable = false)
    private boolean isClientVisible = true;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public ProjectMessage() {}

    public static Builder builder() {
        return new Builder();
    }

    public UUID getMessageId() { return messageId; }
    public void setMessageId(UUID messageId) { this.messageId = messageId; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public boolean isClientVisible() { return isClientVisible; }
    public void setClientVisible(boolean clientVisible) { isClientVisible = clientVisible; }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static class Builder {
        private Project project;
        private String channel = "GENERAL";
        private User sender;
        private String content;
        private boolean isClientVisible = true;
        private boolean isDeleted = false;

        public Builder project(Project project) { this.project = project; return this; }
        public Builder channel(String channel) { this.channel = channel; return this; }
        public Builder sender(User sender) { this.sender = sender; return this; }
        public Builder content(String content) { this.content = content; return this; }
        public Builder isClientVisible(boolean isClientVisible) { this.isClientVisible = isClientVisible; return this; }
        public Builder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }

        public ProjectMessage build() {
            ProjectMessage m = new ProjectMessage();
            m.setProject(this.project);
            m.setChannel(this.channel != null ? this.channel : "GENERAL");
            m.setSender(this.sender);
            m.setContent(this.content);
            m.setClientVisible(this.isClientVisible);
            m.setDeleted(this.isDeleted);
            m.setCreatedAt(Instant.now());
            return m;
        }
    }
}
