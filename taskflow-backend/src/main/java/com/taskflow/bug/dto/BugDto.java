package com.taskflow.bug.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class BugDto {

    public static class CreateBugRequest {
        @NotBlank(message = "Bug title is required")
        @Size(min = 3, max = 255)
        private String title;

        private String description;
        private String stepsToReproduce;
        private String expectedBehavior;
        private String actualBehavior;
        private String severity = "MEDIUM";
        private String priority = "MEDIUM";
        private String environment;
        private Long taskId;
        private Long assignedToId;

        public CreateBugRequest() {}

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
        public String getEnvironment() { return environment; }
        public void setEnvironment(String environment) { this.environment = environment; }
        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }
        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
    }

    public static class UpdateBugRequest {
        @NotBlank(message = "Bug title is required")
        @Size(min = 3, max = 255)
        private String title;

        private String description;
        private String stepsToReproduce;
        private String expectedBehavior;
        private String actualBehavior;
        private String severity;
        private String priority;
        private String environment;
        private Long taskId;
        private Long assignedToId;

        public UpdateBugRequest() {}

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
        public String getEnvironment() { return environment; }
        public void setEnvironment(String environment) { this.environment = environment; }
        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }
        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
    }

    public static class AssignBugRequest {
        @NotNull(message = "Assignee user ID is required")
        private Long assignedToId;

        public AssignBugRequest() {}
        public AssignBugRequest(Long assignedToId) { this.assignedToId = assignedToId; }

        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
    }

    public static class UpdateBugStatusRequest {
        @NotBlank(message = "Status is required")
        private String status;

        public UpdateBugStatusRequest() {}
        public UpdateBugStatusRequest(String status) { this.status = status; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ResolveBugRequest {
        @NotBlank(message = "Resolution notes are required")
        private String resolutionNotes;

        public ResolveBugRequest() {}
        public ResolveBugRequest(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    }

    public static class RetestBugRequest {
        private boolean passed;
        private String retestNotes;

        public RetestBugRequest() {}
        public RetestBugRequest(boolean passed, String retestNotes) {
            this.passed = passed;
            this.retestNotes = retestNotes;
        }

        public boolean isPassed() { return passed; }
        public void setPassed(boolean passed) { this.passed = passed; }
        public String getRetestNotes() { return retestNotes; }
        public void setRetestNotes(String retestNotes) { this.retestNotes = retestNotes; }
    }

    public static class CreateBugCommentRequest {
        @NotBlank(message = "Comment content is required")
        private String content;

        public CreateBugCommentRequest() {}
        public CreateBugCommentRequest(String content) { this.content = content; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class BugCommentResponse {
        private Long commentId;
        private Long userId;
        private String authorName;
        private String content;
        private Instant createdAt;

        public BugCommentResponse() {}
        public BugCommentResponse(Long commentId, Long userId, String authorName, String content, Instant createdAt) {
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

    public static class BugResponse {
        private Long bugId;
        private Long projectId;
        private String projectCode;
        private String projectName;
        private Long taskId;
        private String taskCode;
        private String taskTitle;
        private String bugCode;
        private String title;
        private String description;
        private String stepsToReproduce;
        private String expectedBehavior;
        private String actualBehavior;
        private String severity;
        private String priority;
        private String status;
        private String environment;
        private Long reportedById;
        private String reportedByName;
        private String reportedByEmail;
        private Long assignedToId;
        private String assignedToName;
        private String assignedToEmail;
        private String resolutionNotes;
        private String retestNotes;
        private long commentsCount;
        private Instant createdAt;
        private Instant updatedAt;

        public BugResponse() {}

        public BugResponse(Long bugId, Long projectId, String projectCode, String projectName,
                           Long taskId, String taskCode, String taskTitle, String bugCode,
                           String title, String description, String stepsToReproduce,
                           String expectedBehavior, String actualBehavior, String severity,
                           String priority, String status, String environment,
                           Long reportedById, String reportedByName, String reportedByEmail,
                           Long assignedToId, String assignedToName, String assignedToEmail,
                           String resolutionNotes, String retestNotes, long commentsCount,
                           Instant createdAt, Instant updatedAt) {
            this.bugId = bugId;
            this.projectId = projectId;
            this.projectCode = projectCode;
            this.projectName = projectName;
            this.taskId = taskId;
            this.taskCode = taskCode;
            this.taskTitle = taskTitle;
            this.bugCode = bugCode;
            this.title = title;
            this.description = description;
            this.stepsToReproduce = stepsToReproduce;
            this.expectedBehavior = expectedBehavior;
            this.actualBehavior = actualBehavior;
            this.severity = severity;
            this.priority = priority;
            this.status = status;
            this.environment = environment;
            this.reportedById = reportedById;
            this.reportedByName = reportedByName;
            this.reportedByEmail = reportedByEmail;
            this.assignedToId = assignedToId;
            this.assignedToName = assignedToName;
            this.assignedToEmail = assignedToEmail;
            this.resolutionNotes = resolutionNotes;
            this.retestNotes = retestNotes;
            this.commentsCount = commentsCount;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public Long getBugId() { return bugId; }
        public void setBugId(Long bugId) { this.bugId = bugId; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }
        public String getTaskCode() { return taskCode; }
        public void setTaskCode(String taskCode) { this.taskCode = taskCode; }
        public String getTaskTitle() { return taskTitle; }
        public void setTaskTitle(String taskTitle) { this.taskTitle = taskTitle; }
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
        public Long getReportedById() { return reportedById; }
        public void setReportedById(Long reportedById) { this.reportedById = reportedById; }
        public String getReportedByName() { return reportedByName; }
        public void setReportedByName(String reportedByName) { this.reportedByName = reportedByName; }
        public String getReportedByEmail() { return reportedByEmail; }
        public void setReportedByEmail(String reportedByEmail) { this.reportedByEmail = reportedByEmail; }
        public Long getAssignedToId() { return assignedToId; }
        public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
        public String getAssignedToName() { return assignedToName; }
        public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }
        public String getAssignedToEmail() { return assignedToEmail; }
        public void setAssignedToEmail(String assignedToEmail) { this.assignedToEmail = assignedToEmail; }
        public String getResolutionNotes() { return resolutionNotes; }
        public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
        public String getRetestNotes() { return retestNotes; }
        public void setRetestNotes(String retestNotes) { this.retestNotes = retestNotes; }
        public long getCommentsCount() { return commentsCount; }
        public void setCommentsCount(long commentsCount) { this.commentsCount = commentsCount; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class BugDetailResponse extends BugResponse {
        private List<BugCommentResponse> comments = new ArrayList<>();

        public BugDetailResponse() {}

        public List<BugCommentResponse> getComments() { return comments; }
        public void setComments(List<BugCommentResponse> comments) { this.comments = comments; }
    }

    public static class BugStatsResponse {
        private long total;
        private long open;
        private long assigned;
        private long inProgress;
        private long resolved;
        private long underRetest;
        private long closed;
        private long reopened;
        private long critical;

        public BugStatsResponse() {}

        public BugStatsResponse(long total, long open, long assigned, long inProgress,
                                long resolved, long underRetest, long closed, long reopened,
                                long critical) {
            this.total = total;
            this.open = open;
            this.assigned = assigned;
            this.inProgress = inProgress;
            this.resolved = resolved;
            this.underRetest = underRetest;
            this.closed = closed;
            this.reopened = reopened;
            this.critical = critical;
        }

        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
        public long getOpen() { return open; }
        public void setOpen(long open) { this.open = open; }
        public long getAssigned() { return assigned; }
        public void setAssigned(long assigned) { this.assigned = assigned; }
        public long getInProgress() { return inProgress; }
        public void setInProgress(long inProgress) { this.inProgress = inProgress; }
        public long getResolved() { return resolved; }
        public void setResolved(long resolved) { this.resolved = resolved; }
        public long getUnderRetest() { return underRetest; }
        public void setUnderRetest(long underRetest) { this.underRetest = underRetest; }
        public long getClosed() { return closed; }
        public void setClosed(long closed) { this.closed = closed; }
        public long getReopened() { return reopened; }
        public void setReopened(long reopened) { this.reopened = reopened; }
        public long getCritical() { return critical; }
        public void setCritical(long critical) { this.critical = critical; }
    }
}
