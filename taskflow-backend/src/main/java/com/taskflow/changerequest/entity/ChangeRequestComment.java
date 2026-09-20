package com.taskflow.changerequest.entity;

import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "change_request_comments")
@EntityListeners(AuditingEntityListener.class)
public class ChangeRequestComment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "comment_id", updatable = false, nullable = false)
    private UUID commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "change_request_id", nullable = false)
    private ChangeRequest changeRequest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public ChangeRequestComment() {}

    public ChangeRequestComment(UUID commentId, ChangeRequest changeRequest, User user, String content, Instant createdAt) {
        this.commentId = commentId;
        this.changeRequest = changeRequest;
        this.user = user;
        this.content = content;
        this.createdAt = createdAt;
    }

    public static ChangeRequestCommentBuilder builder() {
        return new ChangeRequestCommentBuilder();
    }

    public static class ChangeRequestCommentBuilder {
        private UUID commentId;
        private ChangeRequest changeRequest;
        private User user;
        private String content;
        private Instant createdAt;

        public ChangeRequestCommentBuilder commentId(UUID commentId) { this.commentId = commentId; return this; }
        public ChangeRequestCommentBuilder changeRequest(ChangeRequest changeRequest) { this.changeRequest = changeRequest; return this; }
        public ChangeRequestCommentBuilder user(User user) { this.user = user; return this; }
        public ChangeRequestCommentBuilder content(String content) { this.content = content; return this; }
        public ChangeRequestCommentBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public ChangeRequestComment build() {
            return new ChangeRequestComment(commentId, changeRequest, user, content, createdAt);
        }
    }

    public UUID getCommentId() { return commentId; }
    public void setCommentId(UUID commentId) { this.commentId = commentId; }
    public ChangeRequest getChangeRequest() { return changeRequest; }
    public void setChangeRequest(ChangeRequest changeRequest) { this.changeRequest = changeRequest; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
