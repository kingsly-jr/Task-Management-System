package com.taskflow.bug.entity;

import com.taskflow.project.entity.Project;
import com.taskflow.task.entity.Task;
import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "bugs")
@EntityListeners(AuditingEntityListener.class)
public class Bug {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "bug_id", updatable = false, nullable = false)
    private UUID bugId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    private Task task;

    @Column(name = "bug_code", nullable = false, length = 50)
    private String bugCode;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "steps_to_reproduce", columnDefinition = "TEXT")
    private String stepsToReproduce;

    @Column(name = "expected_behavior", columnDefinition = "TEXT")
    private String expectedBehavior;

    @Column(name = "actual_behavior", columnDefinition = "TEXT")
    private String actualBehavior;

    @Column(name = "severity", nullable = false, length = 20)
    private String severity = "MEDIUM"; // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    @Column(name = "status", nullable = false, length = 30)
    private String status = "OPEN"; // OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, UNDER_RETEST, CLOSED, REOPENED

    @Column(name = "environment", length = 150)
    private String environment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reported_by", nullable = false)
    private User reportedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to")
    private User assignedTo;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @Column(name = "retest_notes", columnDefinition = "TEXT")
    private String retestNotes;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Bug() {}

    public Bug(UUID bugId, Project project, Task task, String bugCode, String title, String description,
               String stepsToReproduce, String expectedBehavior, String actualBehavior, String severity,
               String priority, String status, String environment, User reportedBy, User assignedTo,
               String resolutionNotes, String retestNotes, boolean isDeleted, Instant deletedAt,
               Instant createdAt, Instant updatedAt) {
        this.bugId = bugId;
        this.project = project;
        this.task = task;
        this.bugCode = bugCode;
        this.title = title;
        this.description = description;
        this.stepsToReproduce = stepsToReproduce;
        this.expectedBehavior = expectedBehavior;
        this.actualBehavior = actualBehavior;
        this.severity = severity != null ? severity : "MEDIUM";
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = status != null ? status : "OPEN";
        this.environment = environment;
        this.reportedBy = reportedBy;
        this.assignedTo = assignedTo;
        this.resolutionNotes = resolutionNotes;
        this.retestNotes = retestNotes;
        this.isDeleted = isDeleted;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static BugBuilder builder() {
        return new BugBuilder();
    }

    public static class BugBuilder {
        private UUID bugId;
        private Project project;
        private Task task;
        private String bugCode;
        private String title;
        private String description;
        private String stepsToReproduce;
        private String expectedBehavior;
        private String actualBehavior;
        private String severity = "MEDIUM";
        private String priority = "MEDIUM";
        private String status = "OPEN";
        private String environment;
        private User reportedBy;
        private User assignedTo;
        private String resolutionNotes;
        private String retestNotes;
        private boolean isDeleted = false;
        private Instant deletedAt;
        private Instant createdAt;
        private Instant updatedAt;

        public BugBuilder bugId(UUID bugId) { this.bugId = bugId; return this; }
        public BugBuilder project(Project project) { this.project = project; return this; }
        public BugBuilder task(Task task) { this.task = task; return this; }
        public BugBuilder bugCode(String bugCode) { this.bugCode = bugCode; return this; }
        public BugBuilder title(String title) { this.title = title; return this; }
        public BugBuilder description(String description) { this.description = description; return this; }
        public BugBuilder stepsToReproduce(String stepsToReproduce) { this.stepsToReproduce = stepsToReproduce; return this; }
        public BugBuilder expectedBehavior(String expectedBehavior) { this.expectedBehavior = expectedBehavior; return this; }
        public BugBuilder actualBehavior(String actualBehavior) { this.actualBehavior = actualBehavior; return this; }
        public BugBuilder severity(String severity) { this.severity = severity; return this; }
        public BugBuilder priority(String priority) { this.priority = priority; return this; }
        public BugBuilder status(String status) { this.status = status; return this; }
        public BugBuilder environment(String environment) { this.environment = environment; return this; }
        public BugBuilder reportedBy(User reportedBy) { this.reportedBy = reportedBy; return this; }
        public BugBuilder assignedTo(User assignedTo) { this.assignedTo = assignedTo; return this; }
        public BugBuilder resolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; return this; }
        public BugBuilder retestNotes(String retestNotes) { this.retestNotes = retestNotes; return this; }
        public BugBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }
        public BugBuilder deletedAt(Instant deletedAt) { this.deletedAt = deletedAt; return this; }
        public BugBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public BugBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public Bug build() {
            return new Bug(bugId, project, task, bugCode, title, description, stepsToReproduce,
                    expectedBehavior, actualBehavior, severity, priority, status, environment,
                    reportedBy, assignedTo, resolutionNotes, retestNotes, isDeleted, deletedAt,
                    createdAt, updatedAt);
        }
    }

    public UUID getBugId() { return bugId; }
    public void setBugId(UUID bugId) { this.bugId = bugId; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Task getTask() { return task; }
    public void setTask(Task task) { this.task = task; }
    public String getBugCode() { return bugCode; }
    public void setBugCode(String bugCode) { this.bugCode = bugCode; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStepsToReproduce() { return stepsToReproduce; }
    public void setStepsToReproduce(String stepsToReproduce) { this.stepsToReproduce = stepsToReproduce; }
    public String getExpectedBehavior() { return expectedBehavior; }
    public void setExpectedBehavior(String expectedBehavior) { this.expectedBehavior = expectedBehavior; }
    public String getActualBehavior() { return actualBehavior; }
    public void setActualBehavior(String actualBehavior) { this.actualBehavior = actualBehavior; }
    public String getSeverity() { return severity; }
    public void setSeverity(String severity) { this.severity = severity; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getEnvironment() { return environment; }
    public void setEnvironment(String environment) { this.environment = environment; }
    public User getReportedBy() { return reportedBy; }
    public void setReportedBy(User reportedBy) { this.reportedBy = reportedBy; }
    public User getAssignedTo() { return assignedTo; }
    public void setAssignedTo(User assignedTo) { this.assignedTo = assignedTo; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public String getRetestNotes() { return retestNotes; }
    public void setRetestNotes(String retestNotes) { this.retestNotes = retestNotes; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
