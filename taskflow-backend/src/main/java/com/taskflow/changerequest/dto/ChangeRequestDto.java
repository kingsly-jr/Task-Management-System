package com.taskflow.changerequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class ChangeRequestDto {

    public static class CreateChangeRequest {
        @NotBlank(message = "Title is required")
        @Size(min = 3, max = 255)
        private String title;

        private String description;
        private String reasonForChange;
        private BigDecimal estimatedCost = BigDecimal.ZERO;
        private Integer scheduleImpactDays = 0;
        private String priority = "MEDIUM";

        public CreateChangeRequest() {}

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
    }

    public static class ReviewChangeRequest {
        private boolean approved;

        @NotBlank(message = "Review notes or justification are required")
        private String reviewNotes;

        public ReviewChangeRequest() {}
        public ReviewChangeRequest(boolean approved, String reviewNotes) {
            this.approved = approved;
            this.reviewNotes = reviewNotes;
        }

        public boolean isApproved() { return approved; }
        public void setApproved(boolean approved) { this.approved = approved; }
        public String getReviewNotes() { return reviewNotes; }
        public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    }

    public static class UpdateStatusRequest {
        @NotBlank(message = "Status is required")
        private String status;

        public UpdateStatusRequest() {}
        public UpdateStatusRequest(String status) { this.status = status; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class CreateCommentRequest {
        @NotBlank(message = "Comment content is required")
        private String content;

        public CreateCommentRequest() {}
        public CreateCommentRequest(String content) { this.content = content; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class CommentResponse {
        private Long commentId;
        private Long userId;
        private String authorName;
        private String content;
        private Instant createdAt;

        public CommentResponse() {}
        public CommentResponse(Long commentId, Long userId, String authorName, String content, Instant createdAt) {
            this.commentId = commentId;
            this.userId = userId;
            this.authorName = authorName;
            this.content = content;
            this.createdAt = createdAt;
        }

        public Long getCommentId() { return commentId; }
        public void setCommentId(Long commentId) { this.commentId = commentId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getAuthorName() { return authorName; }
        public void setAuthorName(String authorName) { this.authorName = authorName; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class ChangeRequestResponse {
        private Long changeRequestId;
        private Long projectId;
        private String projectCode;
        private String projectName;
        private String changeRequestCode;
        private String title;
        private String description;
        private String reasonForChange;
        private BigDecimal estimatedCost;
        private Integer scheduleImpactDays;
        private String priority;
        private String status;
        private Long requestedById;
        private String requestedByName;
        private String requestedByEmail;
        private Long reviewedById;
        private String reviewedByName;
        private String reviewedByEmail;
        private String reviewNotes;
        private Instant reviewedAt;
        private long commentsCount;
        private Instant createdAt;
        private Instant updatedAt;

        public ChangeRequestResponse() {}

        public ChangeRequestResponse(Long changeRequestId, Long projectId, String projectCode,
                                     String projectName, String changeRequestCode, String title,
                                     String description, String reasonForChange, BigDecimal estimatedCost,
                                     Integer scheduleImpactDays, String priority, String status,
                                     Long requestedById, String requestedByName, String requestedByEmail,
                                     Long reviewedById, String reviewedByName, String reviewedByEmail,
                                     String reviewNotes, Instant reviewedAt, long commentsCount,
                                     Instant createdAt, Instant updatedAt) {
            this.changeRequestId = changeRequestId;
            this.projectId = projectId;
            this.projectCode = projectCode;
            this.projectName = projectName;
            this.changeRequestCode = changeRequestCode;
            this.title = title;
            this.description = description;
            this.reasonForChange = reasonForChange;
            this.estimatedCost = estimatedCost;
            this.scheduleImpactDays = scheduleImpactDays;
            this.priority = priority;
            this.status = status;
            this.requestedById = requestedById;
            this.requestedByName = requestedByName;
            this.requestedByEmail = requestedByEmail;
            this.reviewedById = reviewedById;
            this.reviewedByName = reviewedByName;
            this.reviewedByEmail = reviewedByEmail;
            this.reviewNotes = reviewNotes;
            this.reviewedAt = reviewedAt;
            this.commentsCount = commentsCount;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public Long getChangeRequestId() { return changeRequestId; }
        public void setChangeRequestId(Long changeRequestId) { this.changeRequestId = changeRequestId; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
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
        public Long getRequestedById() { return requestedById; }
        public void setRequestedById(Long requestedById) { this.requestedById = requestedById; }
        public String getRequestedByName() { return requestedByName; }
        public void setRequestedByName(String requestedByName) { this.requestedByName = requestedByName; }
        public String getRequestedByEmail() { return requestedByEmail; }
        public void setRequestedByEmail(String requestedByEmail) { this.requestedByEmail = requestedByEmail; }
        public Long getReviewedById() { return reviewedById; }
        public void setReviewedById(Long reviewedById) { this.reviewedById = reviewedById; }
        public String getReviewedByName() { return reviewedByName; }
        public void setReviewedByName(String reviewedByName) { this.reviewedByName = reviewedByName; }
        public String getReviewedByEmail() { return reviewedByEmail; }
        public void setReviewedByEmail(String reviewedByEmail) { this.reviewedByEmail = reviewedByEmail; }
        public String getReviewNotes() { return reviewNotes; }
        public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
        public Instant getReviewedAt() { return reviewedAt; }
        public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
        public long getCommentsCount() { return commentsCount; }
        public void setCommentsCount(long commentsCount) { this.commentsCount = commentsCount; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class ChangeRequestDetailResponse extends ChangeRequestResponse {
        private List<CommentResponse> comments = new ArrayList<>();

        public ChangeRequestDetailResponse() {}

        public List<CommentResponse> getComments() { return comments; }
        public void setComments(List<CommentResponse> comments) { this.comments = comments; }
    }

    public static class ChangeRequestStatsResponse {
        private long total;
        private long submitted;
        private long underReview;
        private long approved;
        private long rejected;
        private long implemented;
        private BigDecimal totalApprovedCost = BigDecimal.ZERO;
        private int totalScheduleImpactDays = 0;

        public ChangeRequestStatsResponse() {}

        public ChangeRequestStatsResponse(long total, long submitted, long underReview,
                                          long approved, long rejected, long implemented,
                                          BigDecimal totalApprovedCost, int totalScheduleImpactDays) {
            this.total = total;
            this.submitted = submitted;
            this.underReview = underReview;
            this.approved = approved;
            this.rejected = rejected;
            this.implemented = implemented;
            this.totalApprovedCost = totalApprovedCost != null ? totalApprovedCost : BigDecimal.ZERO;
            this.totalScheduleImpactDays = totalScheduleImpactDays;
        }

        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
        public long getSubmitted() { return submitted; }
        public void setSubmitted(long submitted) { this.submitted = submitted; }
        public long getUnderReview() { return underReview; }
        public void setUnderReview(long underReview) { this.underReview = underReview; }
        public long getApproved() { return approved; }
        public void setApproved(long approved) { this.approved = approved; }
        public long getRejected() { return rejected; }
        public void setRejected(long rejected) { this.rejected = rejected; }
        public long getImplemented() { return implemented; }
        public void setImplemented(long implemented) { this.implemented = implemented; }
        public BigDecimal getTotalApprovedCost() { return totalApprovedCost; }
        public void setTotalApprovedCost(BigDecimal totalApprovedCost) { this.totalApprovedCost = totalApprovedCost; }
        public int getTotalScheduleImpactDays() { return totalScheduleImpactDays; }
        public void setTotalScheduleImpactDays(int totalScheduleImpactDays) { this.totalScheduleImpactDays = totalScheduleImpactDays; }
    }
}
