package com.taskflow.changerequest.entity;

import com.taskflow.project.entity.Project;
import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "change_requests")
@EntityListeners(AuditingEntityListener.class)
public class ChangeRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "change_request_id", updatable = false, nullable = false)
    private UUID changeRequestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "change_request_code", nullable = false, length = 50)
    private String changeRequestCode;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "reason_for_change", columnDefinition = "TEXT")
    private String reasonForChange;

    @Column(name = "estimated_cost", precision = 12, scale = 2)
    private BigDecimal estimatedCost = BigDecimal.ZERO;

    @Column(name = "schedule_impact_days")
    private Integer scheduleImpactDays = 0;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    @Column(name = "status", nullable = false, length = 30)
    private String status = "SUBMITTED"; // SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, IMPLEMENTED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by", nullable = false)
    private User requestedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

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

    public ChangeRequest() {}

    public ChangeRequest(UUID changeRequestId, Project project, String changeRequestCode, String title,
                         String description, String reasonForChange, BigDecimal estimatedCost,
                         Integer scheduleImpactDays, String priority, String status, User requestedBy,
                         User reviewedBy, String reviewNotes, Instant reviewedAt, boolean isDeleted,
                         Instant deletedAt, Instant createdAt, Instant updatedAt) {
        this.changeRequestId = changeRequestId;
        this.project = project;
        this.changeRequestCode = changeRequestCode;
        this.title = title;
        this.description = description;
        this.reasonForChange = reasonForChange;
        this.estimatedCost = estimatedCost != null ? estimatedCost : BigDecimal.ZERO;
        this.scheduleImpactDays = scheduleImpactDays != null ? scheduleImpactDays : 0;
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = status != null ? status : "SUBMITTED";
        this.requestedBy = requestedBy;
        this.reviewedBy = reviewedBy;
        this.reviewNotes = reviewNotes;
        this.reviewedAt = reviewedAt;
        this.isDeleted = isDeleted;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ChangeRequestBuilder builder() {
        return new ChangeRequestBuilder();
    }

    public static class ChangeRequestBuilder {
        private UUID changeRequestId;
        private Project project;
        private String changeRequestCode;
        private String title;
        private String description;
        private String reasonForChange;
        private BigDecimal estimatedCost = BigDecimal.ZERO;
        private Integer scheduleImpactDays = 0;
        private String priority = "MEDIUM";
        private String status = "SUBMITTED";
        private User requestedBy;
        private User reviewedBy;
        private String reviewNotes;
        private Instant reviewedAt;
        private boolean isDeleted = false;
        private Instant deletedAt;
        private Instant createdAt;
        private Instant updatedAt;

        public ChangeRequestBuilder changeRequestId(UUID changeRequestId) { this.changeRequestId = changeRequestId; return this; }
        public ChangeRequestBuilder project(Project project) { this.project = project; return this; }
        public ChangeRequestBuilder changeRequestCode(String changeRequestCode) { this.changeRequestCode = changeRequestCode; return this; }
        public ChangeRequestBuilder title(String title) { this.title = title; return this; }
        public ChangeRequestBuilder description(String description) { this.description = description; return this; }
        public ChangeRequestBuilder reasonForChange(String reasonForChange) { this.reasonForChange = reasonForChange; return this; }
        public ChangeRequestBuilder estimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; return this; }
        public ChangeRequestBuilder scheduleImpactDays(Integer scheduleImpactDays) { this.scheduleImpactDays = scheduleImpactDays; return this; }
        public ChangeRequestBuilder priority(String priority) { this.priority = priority; return this; }
        public ChangeRequestBuilder status(String status) { this.status = status; return this; }
        public ChangeRequestBuilder requestedBy(User requestedBy) { this.requestedBy = requestedBy; return this; }
        public ChangeRequestBuilder reviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; return this; }
        public ChangeRequestBuilder reviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; return this; }
        public ChangeRequestBuilder reviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; return this; }
        public ChangeRequestBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }
        public ChangeRequestBuilder deletedAt(Instant deletedAt) { this.deletedAt = deletedAt; return this; }
        public ChangeRequestBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public ChangeRequestBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public ChangeRequest build() {
            return new ChangeRequest(changeRequestId, project, changeRequestCode, title, description,
                    reasonForChange, estimatedCost, scheduleImpactDays, priority, status,
                    requestedBy, reviewedBy, reviewNotes, reviewedAt, isDeleted, deletedAt,
                    createdAt, updatedAt);
        }
    }

    public UUID getChangeRequestId() { return changeRequestId; }
    public void setChangeRequestId(UUID changeRequestId) { this.changeRequestId = changeRequestId; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getChangeRequestCode() { return changeRequestCode; }
    public void setChangeRequestCode(String changeRequestCode) { this.changeRequestCode = changeRequestCode; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReasonForChange() { return reasonForChange; }
    public void setReasonForChange(String reasonForChange) { this.reasonForChange = reasonForChange; }
    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
    public Integer getScheduleImpactDays() { return scheduleImpactDays; }
    public void setScheduleImpactDays(Integer scheduleImpactDays) { this.scheduleImpactDays = scheduleImpactDays; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public User getRequestedBy() { return requestedBy; }
    public void setRequestedBy(User requestedBy) { this.requestedBy = requestedBy; }
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public String getReviewNotes() { return reviewNotes; }
    public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    public Instant getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
