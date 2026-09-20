package com.taskflow.task.entity;

import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "task_comments")
@EntityListeners(AuditingEntityListener.class)
public class TaskComment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "comment_id", updatable = false, nullable = false)
    private UUID commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public TaskComment() {}

    public TaskComment(UUID commentId, Task task, User user, String content, Instant createdAt) {
        this.commentId = commentId;
        this.task = task;
        this.user = user;
        this.content = content;
        this.createdAt = createdAt;
    }

    public static TaskCommentBuilder builder() {
        return new TaskCommentBuilder();
    }

    public static class TaskCommentBuilder {
        private UUID commentId;
        private Task task;
        private User user;
        private String content;
        private Instant createdAt;

        public TaskCommentBuilder commentId(UUID commentId) { this.commentId = commentId; return this; }
        public TaskCommentBuilder task(Task task) { this.task = task; return this; }
        public TaskCommentBuilder user(User user) { this.user = user; return this; }
        public TaskCommentBuilder content(String content) { this.content = content; return this; }
        public TaskCommentBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public TaskComment build() {
            return new TaskComment(commentId, task, user, content, createdAt);
        }
    }

    public UUID getCommentId() { return commentId; }
    public void setCommentId(UUID commentId) { this.commentId = commentId; }
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
