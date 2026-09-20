package com.taskflow.bug.entity;

import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;


@Entity
@Table(name = "bug_comments")
@EntityListeners(AuditingEntityListener.class)
public class BugComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "comment_id", updatable = false, nullable = false)
    private Long commentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bug_id", nullable = false)
    private Bug bug;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public BugComment() {}

    public BugComment(Long commentId, Bug bug, User user, String content, Instant createdAt) {
        this.commentId = commentId;
        this.bug = bug;
        this.user = user;
        this.content = content;
        this.createdAt = createdAt;
    }

    public static BugCommentBuilder builder() {
        return new BugCommentBuilder();
    }

    public static class BugCommentBuilder {
        private Long commentId;
        private Bug bug;
        private User user;
        private String content;
        private Instant createdAt;

        public BugCommentBuilder commentId(Long commentId) { this.commentId = commentId; return this; }
        public BugCommentBuilder bug(Bug bug) { this.bug = bug; return this; }
        public BugCommentBuilder user(User user) { this.user = user; return this; }
        public BugCommentBuilder content(String content) { this.content = content; return this; }
        public BugCommentBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public BugComment build() {
            return new BugComment(commentId, bug, user, content, createdAt);
        }
    }

    public Long getCommentId() { return commentId; }
    public void setCommentId(Long commentId) { this.commentId = commentId; }
    public Bug getBug() { return bug; }
    public void setBug(Bug bug) { this.bug = bug; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
