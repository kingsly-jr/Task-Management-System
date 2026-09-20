package com.taskflow.worklog.entity;

import com.taskflow.project.entity.Project;
import com.taskflow.task.entity.Task;
import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;


@Entity
@Table(name = "worklogs")
@EntityListeners(AuditingEntityListener.class)
public class Worklog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "worklog_id", updatable = false, nullable = false)
    private Long worklogId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "task_id")
    private Task task;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "hours_spent", nullable = false, precision = 5, scale = 2)
    private BigDecimal hoursSpent;

    @Column(name = "description", columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(name = "is_billable", nullable = false)
    private boolean isBillable = true;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "SUBMITTED"; // SUBMITTED, APPROVED, REJECTED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @Column(name = "review_notes", length = 500)
    private String reviewNotes;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Worklog() {}

    public static Builder builder() {
        return new Builder();
    }

    public Long getWorklogId() { return worklogId; }
    public void setWorklogId(Long worklogId) { this.worklogId = worklogId; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getLogDate() { return logDate; }
    public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

    public BigDecimal getHoursSpent() { return hoursSpent; }
    public void setHoursSpent(BigDecimal hoursSpent) { this.hoursSpent = hoursSpent; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isBillable() { return isBillable; }
    public void setBillable(boolean billable) { isBillable = billable; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }

    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }

    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static class Builder {
        private Project project;
        private Task task;
        private User user;
        private LocalDate logDate;
        private BigDecimal hoursSpent;
        private String description;
        private boolean isBillable = true;
        private String status = "SUBMITTED";
        private User reviewedBy;
        private Instant reviewedAt;
        private String reviewNotes;
        private boolean isDeleted = false;

        public Builder project(Project project) { this.project = project; return this; }
        public Builder task(Task task) { this.task = task; return this; }
        public Builder user(User user) { this.user = user; return this; }
        public Builder logDate(LocalDate logDate) { this.logDate = logDate; return this; }
        public Builder hoursSpent(BigDecimal hoursSpent) { this.hoursSpent = hoursSpent; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder isBillable(boolean isBillable) { this.isBillable = isBillable; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder reviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; return this; }
        public Builder reviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; return this; }
        public Builder reviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; return this; }
        public Builder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }

        public Worklog build() {
            Worklog w = new Worklog();
            w.setProject(this.project);
            w.setTask(this.task);
            w.setUser(this.user);
            w.setLogDate(this.logDate != null ? this.logDate : LocalDate.now());
            w.setHoursSpent(this.hoursSpent != null ? this.hoursSpent : BigDecimal.ZERO);
            w.setDescription(this.description);
            w.setBillable(this.isBillable);
            w.setStatus(this.status != null ? this.status : "SUBMITTED");
            w.setReviewedBy(this.reviewedBy);
            w.setReviewedAt(this.reviewedAt);
            w.setReviewNotes(this.reviewNotes);
            w.setDeleted(this.isDeleted);
            w.setCreatedAt(Instant.now());
            w.setUpdatedAt(Instant.now());
            return w;
        }
    }
}
