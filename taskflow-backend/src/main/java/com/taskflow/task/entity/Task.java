package com.taskflow.task.entity;

import com.taskflow.milestone.entity.Milestone;
import com.taskflow.project.entity.Project;
import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;


@Entity
@Table(name = "tasks")
@EntityListeners(AuditingEntityListener.class)
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id", updatable = false, nullable = false)
    private Long taskId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "milestone_id")
    private Milestone milestone;

    @Column(name = "task_code", nullable = false, unique = true, length = 50)
    private String taskCode;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "TODO";

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    @Column(name = "estimated_hours", precision = 6, scale = 2)
    private BigDecimal estimatedHours;

    @Column(name = "logged_hours", precision = 6, scale = 2)
    private BigDecimal loggedHours = BigDecimal.ZERO;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "task_assignees",
            joinColumns = @JoinColumn(name = "task_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> assignees = new HashSet<>();

    @Column(name = "approval_status", length = 30)
    private String approvalStatus = "NONE"; // NONE, PENDING_APPROVAL, APPROVED, REJECTED

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "completed_by")
    private User completedBy;

    @Column(name = "completed_at")
    private Instant completedAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "approved_by")
    private User approvedBy;

    @Column(name = "approved_at")
    private Instant approvedAt;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "review_url", length = 500)
    private String reviewUrl;

    @Column(name = "review_document_name", length = 255)
    private String reviewDocumentName;

    @Column(name = "review_document_path", length = 500)
    private String reviewDocumentPath;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "submitted_for_review_at")
    private Instant submittedForReviewAt;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "submitted_for_review_by")
    private User submittedForReviewBy;

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

    public Task() {}

    public Task(Long taskId, Project project, Milestone milestone, String taskCode, String title, String description,
                String status, String priority, BigDecimal estimatedHours, BigDecimal loggedHours,
                LocalDate startDate, LocalDate dueDate, User createdBy, Set<User> assignees,
                String approvalStatus, User completedBy, Instant completedAt, User approvedBy, Instant approvedAt,
                String rejectionReason, String reviewUrl, String reviewDocumentName, String reviewDocumentPath,
                String reviewNotes, Instant submittedForReviewAt, User submittedForReviewBy,
                boolean isDeleted, Instant deletedAt, Instant createdAt, Instant updatedAt) {
        this.taskId = taskId;
        this.project = project;
        this.milestone = milestone;
        this.taskCode = taskCode;
        this.title = title;
        this.description = description;
        this.status = status != null ? status : "TODO";
        this.priority = priority != null ? priority : "MEDIUM";
        this.estimatedHours = estimatedHours;
        this.loggedHours = loggedHours != null ? loggedHours : BigDecimal.ZERO;
        this.startDate = startDate;
        this.dueDate = dueDate;
        this.createdBy = createdBy;
        this.assignees = assignees != null ? assignees : new HashSet<>();
        this.approvalStatus = approvalStatus != null ? approvalStatus : "NONE";
        this.completedBy = completedBy;
        this.completedAt = completedAt;
        this.approvedBy = approvedBy;
        this.approvedAt = approvedAt;
        this.rejectionReason = rejectionReason;
        this.reviewUrl = reviewUrl;
        this.reviewDocumentName = reviewDocumentName;
        this.reviewDocumentPath = reviewDocumentPath;
        this.reviewNotes = reviewNotes;
        this.submittedForReviewAt = submittedForReviewAt;
        this.submittedForReviewBy = submittedForReviewBy;
        this.isDeleted = isDeleted;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static TaskBuilder builder() {
        return new TaskBuilder();
    }

    public static class TaskBuilder {
        private Long taskId;
        private Project project;
        private Milestone milestone;
        private String taskCode;
        private String title;
        private String description;
        private String status = "TODO";
        private String priority = "MEDIUM";
        private BigDecimal estimatedHours;
        private BigDecimal loggedHours = BigDecimal.ZERO;
        private LocalDate startDate;
        private LocalDate dueDate;
        private User createdBy;
        private Set<User> assignees = new HashSet<>();
        private String approvalStatus = "NONE";
        private User completedBy;
        private Instant completedAt;
        private User approvedBy;
        private Instant approvedAt;
        private String rejectionReason;
        private String reviewUrl;
        private String reviewDocumentName;
        private String reviewDocumentPath;
        private String reviewNotes;
        private Instant submittedForReviewAt;
        private User submittedForReviewBy;
        private boolean isDeleted = false;
        private Instant deletedAt;
        private Instant createdAt;
        private Instant updatedAt;

        public TaskBuilder taskId(Long taskId) { this.taskId = taskId; return this; }
        public TaskBuilder project(Project project) { this.project = project; return this; }
        public TaskBuilder milestone(Milestone milestone) { this.milestone = milestone; return this; }
        public TaskBuilder taskCode(String taskCode) { this.taskCode = taskCode; return this; }
        public TaskBuilder title(String title) { this.title = title; return this; }
        public TaskBuilder description(String description) { this.description = description; return this; }
        public TaskBuilder status(String status) { this.status = status; return this; }
        public TaskBuilder priority(String priority) { this.priority = priority; return this; }
        public TaskBuilder estimatedHours(BigDecimal estimatedHours) { this.estimatedHours = estimatedHours; return this; }
        public TaskBuilder loggedHours(BigDecimal loggedHours) { this.loggedHours = loggedHours; return this; }
        public TaskBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public TaskBuilder dueDate(LocalDate dueDate) { this.dueDate = dueDate; return this; }
        public TaskBuilder createdBy(User createdBy) { this.createdBy = createdBy; return this; }
        public TaskBuilder assignees(Set<User> assignees) { this.assignees = assignees; return this; }
        public TaskBuilder approvalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; return this; }
        public TaskBuilder completedBy(User completedBy) { this.completedBy = completedBy; return this; }
        public TaskBuilder completedAt(Instant completedAt) { this.completedAt = completedAt; return this; }
        public TaskBuilder approvedBy(User approvedBy) { this.approvedBy = approvedBy; return this; }
        public TaskBuilder approvedAt(Instant approvedAt) { this.approvedAt = approvedAt; return this; }
        public TaskBuilder rejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; return this; }
        public TaskBuilder reviewUrl(String reviewUrl) { this.reviewUrl = reviewUrl; return this; }
        public TaskBuilder reviewDocumentName(String reviewDocumentName) { this.reviewDocumentName = reviewDocumentName; return this; }
        public TaskBuilder reviewDocumentPath(String reviewDocumentPath) { this.reviewDocumentPath = reviewDocumentPath; return this; }
        public TaskBuilder reviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; return this; }
        public TaskBuilder submittedForReviewAt(Instant submittedForReviewAt) { this.submittedForReviewAt = submittedForReviewAt; return this; }
        public TaskBuilder submittedForReviewBy(User submittedForReviewBy) { this.submittedForReviewBy = submittedForReviewBy; return this; }
        public TaskBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }
        public TaskBuilder deletedAt(Instant deletedAt) { this.deletedAt = deletedAt; return this; }
        public TaskBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public TaskBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public Task build() {
            return new Task(taskId, project, milestone, taskCode, title, description, status, priority,
                    estimatedHours, loggedHours, startDate, dueDate, createdBy, assignees,
                    approvalStatus, completedBy, completedAt, approvedBy, approvedAt, rejectionReason,
                    reviewUrl, reviewDocumentName, reviewDocumentPath, reviewNotes, submittedForReviewAt, submittedForReviewBy,
                    isDeleted, deletedAt, createdAt, updatedAt);
        }
    }

    public Long getTaskId() { return taskId; }
    public void setTaskId(Long taskId) { this.taskId = taskId; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Milestone getMilestone() { return milestone; }
    public void setMilestone(Milestone milestone) { this.milestone = milestone; }
    public String getTaskCode() { return taskCode; }
    public void setTaskCode(String taskCode) { this.taskCode = taskCode; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public BigDecimal getEstimatedHours() { return estimatedHours; }
    public void setEstimatedHours(BigDecimal estimatedHours) { this.estimatedHours = estimatedHours; }
    public BigDecimal getLoggedHours() { return loggedHours; }
    public void setLoggedHours(BigDecimal loggedHours) { this.loggedHours = loggedHours; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }
    public Set<User> getAssignees() { return assignees; }
    public void setAssignees(Set<User> assignees) { this.assignees = assignees; }
    public String getApprovalStatus() { return approvalStatus; }
    public void setApprovalStatus(String approvalStatus) { this.approvalStatus = approvalStatus; }
    public User getCompletedBy() { return completedBy; }
    public void setCompletedBy(User completedBy) { this.completedBy = completedBy; }
    public Instant getCompletedAt() { return completedAt; }
    public void setCompletedAt(Instant completedAt) { this.completedAt = completedAt; }
    public User getApprovedBy() { return approvedBy; }
    public void setApprovedBy(User approvedBy) { this.approvedBy = approvedBy; }
    public Instant getApprovedAt() { return approvedAt; }
    public void setApprovedAt(Instant approvedAt) { this.approvedAt = approvedAt; }
    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }
    public String getReviewUrl() { return reviewUrl; }
    public void setReviewUrl(String reviewUrl) { this.reviewUrl = reviewUrl; }
    public String getReviewDocumentName() { return reviewDocumentName; }
    public void setReviewDocumentName(String reviewDocumentName) { this.reviewDocumentName = reviewDocumentName; }
    public String getReviewDocumentPath() { return reviewDocumentPath; }
    public void setReviewDocumentPath(String reviewDocumentPath) { this.reviewDocumentPath = reviewDocumentPath; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    public Instant getSubmittedForReviewAt() { return submittedForReviewAt; }
    public void setSubmittedForReviewAt(Instant submittedForReviewAt) { this.submittedForReviewAt = submittedForReviewAt; }
    public User getSubmittedForReviewBy() { return submittedForReviewBy; }
    public void setSubmittedForReviewBy(User submittedForReviewBy) { this.submittedForReviewBy = submittedForReviewBy; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
