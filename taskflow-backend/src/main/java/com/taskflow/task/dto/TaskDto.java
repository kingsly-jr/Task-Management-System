package com.taskflow.task.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class TaskDto {

    public static class CreateTaskRequest {
        @NotBlank(message = "Task title is required")
        @Size(min = 2, max = 200)
        private String title;

        private String description;
        private String priority = "MEDIUM";
        private BigDecimal estimatedHours;
        private LocalDate startDate;
        private LocalDate dueDate;
        private Long milestoneId;
        private List<Long> assigneeIds = new ArrayList<>();

        public CreateTaskRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public BigDecimal getEstimatedHours() { return estimatedHours; }
        public void setEstimatedHours(BigDecimal estimatedHours) { this.estimatedHours = estimatedHours; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public Long getMilestoneId() { return milestoneId; }
        public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }
        public List<Long> getAssigneeIds() { return assigneeIds; }
        public void setAssigneeIds(List<Long> assigneeIds) { this.assigneeIds = assigneeIds; }
    }

    public static class UpdateTaskRequest {
        @NotBlank(message = "Task title is required")
        private String title;

        private String description;
        private String priority;
        private String status;
        private BigDecimal estimatedHours;
        private BigDecimal loggedHours;
        private LocalDate startDate;
        private LocalDate dueDate;
        private Long milestoneId;
        private List<Long> assigneeIds;

        public UpdateTaskRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public BigDecimal getEstimatedHours() { return estimatedHours; }
        public void setEstimatedHours(BigDecimal estimatedHours) { this.estimatedHours = estimatedHours; }
        public BigDecimal getLoggedHours() { return loggedHours; }
        public void setLoggedHours(BigDecimal loggedHours) { this.loggedHours = loggedHours; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
        public Long getMilestoneId() { return milestoneId; }
        public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }
        public List<Long> getAssigneeIds() { return assigneeIds; }
        public void setAssigneeIds(List<Long> assigneeIds) { this.assigneeIds = assigneeIds; }
    }

    public static class AssigneeSummary {
        private Long userId;
        private String fullName;
        private String email;
        private String roleCategoryName;

        public AssigneeSummary() {}

        public AssigneeSummary(Long userId, String fullName, String email, String roleCategoryName) {
            this.userId = userId;
            this.fullName = fullName;
            this.email = email;
            this.roleCategoryName = roleCategoryName;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getRoleCategoryName() { return roleCategoryName; }
        public void setRoleCategoryName(String roleCategoryName) { this.roleCategoryName = roleCategoryName; }
    }

    public static class TaskResponse {
        private Long taskId;
        private Long projectId;
        private String projectCode;
        private String projectName;
        private String taskCode;
        private String title;
        private String description;
        private String status;
        private String priority;
        private BigDecimal estimatedHours;
        private BigDecimal loggedHours;
        private LocalDate startDate;
        private LocalDate dueDate;
        private Long milestoneId;
        private String milestoneTitle;
        private long subtasksCount;
        private long completedSubtasksCount;
        private List<AssigneeSummary> assignees;
        private Instant createdAt;
        private Instant updatedAt;

        public TaskResponse() {}

        public TaskResponse(Long taskId, Long projectId, String projectCode, String projectName,
                            String taskCode, String title, String description, String status,
                            String priority, BigDecimal estimatedHours, BigDecimal loggedHours,
                            LocalDate startDate, LocalDate dueDate, long subtasksCount,
                            long completedSubtasksCount, List<AssigneeSummary> assignees,
                            Instant createdAt, Instant updatedAt) {
            this.taskId = taskId;
            this.projectId = projectId;
            this.projectCode = projectCode;
            this.projectName = projectName;
            this.taskCode = taskCode;
            this.title = title;
            this.description = description;
            this.status = status;
            this.priority = priority;
            this.estimatedHours = estimatedHours;
            this.loggedHours = loggedHours;
            this.startDate = startDate;
            this.dueDate = dueDate;
            this.subtasksCount = subtasksCount;
            this.completedSubtasksCount = completedSubtasksCount;
            this.assignees = assignees;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
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
        public Long getMilestoneId() { return milestoneId; }
        public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }
        public String getMilestoneTitle() { return milestoneTitle; }
        public void setMilestoneTitle(String milestoneTitle) { this.milestoneTitle = milestoneTitle; }
        public long getSubtasksCount() { return subtasksCount; }
        public void setSubtasksCount(long subtasksCount) { this.subtasksCount = subtasksCount; }
        public long getCompletedSubtasksCount() { return completedSubtasksCount; }
        public void setCompletedSubtasksCount(long completedSubtasksCount) { this.completedSubtasksCount = completedSubtasksCount; }
        public List<AssigneeSummary> getAssignees() { return assignees; }
        public void setAssignees(List<AssigneeSummary> assignees) { this.assignees = assignees; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class TaskDetailResponse extends TaskResponse {
        private List<SubtaskResponse> subtasks = new ArrayList<>();
        private List<CommentResponse> comments = new ArrayList<>();

        public TaskDetailResponse() {}

        public List<SubtaskResponse> getSubtasks() { return subtasks; }
        public void setSubtasks(List<SubtaskResponse> subtasks) { this.subtasks = subtasks; }
        public List<CommentResponse> getComments() { return comments; }
        public void setComments(List<CommentResponse> comments) { this.comments = comments; }
    }

    public static class CreateSubtaskRequest {
        @NotBlank(message = "Subtask title is required")
        private String title;

        public CreateSubtaskRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
    }

    public static class SubtaskResponse {
        private Long subtaskId;
        private String title;
        private boolean isCompleted;
        private Instant createdAt;

        public SubtaskResponse() {}

        public SubtaskResponse(Long subtaskId, String title, boolean isCompleted, Instant createdAt) {
            this.subtaskId = subtaskId;
            this.title = title;
            this.isCompleted = isCompleted;
            this.createdAt = createdAt;
        }

        public Long getSubtaskId() { return subtaskId; }
        public void setSubtaskId(Long subtaskId) { this.subtaskId = subtaskId; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public boolean isCompleted() { return isCompleted; }
        public void setCompleted(boolean completed) { isCompleted = completed; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class CreateCommentRequest {
        @NotBlank(message = "Comment content is required")
        private String content;

        public CreateCommentRequest() {}

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }

    public static class CommentResponse {
        private Long commentId;
        private Long userId;
        private String userName;
        private String content;
        private Instant createdAt;

        public CommentResponse() {}

        public CommentResponse(Long commentId, Long userId, String userName, String content, Instant createdAt) {
            this.commentId = commentId;
            this.userId = userId;
            this.userName = userName;
            this.content = content;
            this.createdAt = createdAt;
        }

        public Long getCommentId() { return commentId; }
        public void setCommentId(Long commentId) { this.commentId = commentId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class TaskStatsResponse {
        private long total;
        private long todo;
        private long inProgress;
        private long inReview;
        private long blocked;
        private long completed;

        public TaskStatsResponse() {}

        public TaskStatsResponse(long total, long todo, long inProgress, long inReview, long blocked, long completed) {
            this.total = total;
            this.todo = todo;
            this.inProgress = inProgress;
            this.inReview = inReview;
            this.blocked = blocked;
            this.completed = completed;
        }

        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
        public long getTodo() { return todo; }
        public void setTodo(long todo) { this.todo = todo; }
        public long getInProgress() { return inProgress; }
        public void setInProgress(long inProgress) { this.inProgress = inProgress; }
        public long getInReview() { return inReview; }
        public void setInReview(long inReview) { this.inReview = inReview; }
        public long getBlocked() { return blocked; }
        public void setBlocked(long blocked) { this.blocked = blocked; }
        public long getCompleted() { return completed; }
        public void setCompleted(long completed) { this.completed = completed; }
    }
}
