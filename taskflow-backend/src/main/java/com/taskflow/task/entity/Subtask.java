package com.taskflow.task.entity;

import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "subtasks")
@EntityListeners(AuditingEntityListener.class)
public class Subtask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "subtask_id", updatable = false, nullable = false)
    private UUID subtaskId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @Column(name = "title", nullable = false, length = 250)
    private String title;

    @Column(name = "is_completed", nullable = false)
    private boolean isCompleted = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Subtask() {}

    public Subtask(UUID subtaskId, Task task, String title, boolean isCompleted, User assignedTo,
                   Instant createdAt, Instant updatedAt) {
        this.subtaskId = subtaskId;
        this.task = task;
        this.title = title;
        this.isCompleted = isCompleted;
        this.assignedTo = assignedTo;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static SubtaskBuilder builder() {
        return new SubtaskBuilder();
    }

    public static class SubtaskBuilder {
        private UUID subtaskId;
        private Task task;
        private String title;
        private boolean isCompleted = false;
        private User assignedTo;
        private Instant createdAt;
        private Instant updatedAt;

        public SubtaskBuilder subtaskId(UUID subtaskId) { this.subtaskId = subtaskId; return this; }
        public SubtaskBuilder task(Task task) { this.task = task; return this; }
        public SubtaskBuilder title(String title) { this.title = title; return this; }
        public SubtaskBuilder isCompleted(boolean isCompleted) { this.isCompleted = isCompleted; return this; }
        public SubtaskBuilder assignedTo(User assignedTo) { this.assignedTo = assignedTo; return this; }
        public SubtaskBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public SubtaskBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public Subtask build() {
            return new Subtask(subtaskId, task, title, isCompleted, assignedTo, createdAt, updatedAt);
        }
    }

    public UUID getSubtaskId() { return subtaskId; }
    public void setSubtaskId(UUID subtaskId) { this.subtaskId = subtaskId; }
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public boolean isCompleted() { return isCompleted; }
    public void setCompleted(boolean completed) { isCompleted = completed; }
    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
