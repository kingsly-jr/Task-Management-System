package com.taskflow.milestone.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class MilestoneDto {

    public static class CreateMilestoneRequest {
        @NotBlank(message = "Milestone title is required")
        @Size(min = 2, max = 150)
        private String title;

        private String description;

        @NotNull(message = "Target date is required")
        private LocalDate targetDate;

        private int orderIndex = 1;

        public CreateMilestoneRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDate getTargetDate() { return targetDate; }
        public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    }

    public static class UpdateMilestoneRequest {
        @NotBlank(message = "Milestone title is required")
        private String title;

        private String description;

        @NotNull(message = "Target date is required")
        private LocalDate targetDate;

        private LocalDate actualCompletionDate;
        private String status;
        private int orderIndex;

        public UpdateMilestoneRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDate getTargetDate() { return targetDate; }
        public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
        public LocalDate getActualCompletionDate() { return actualCompletionDate; }
        public void setActualCompletionDate(LocalDate actualCompletionDate) { this.actualCompletionDate = actualCompletionDate; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    }

    public static class MilestoneResponse {
        private UUID milestoneId;
        private UUID projectId;
        private String projectCode;
        private String projectName;
        private String title;
        private String description;
        private LocalDate targetDate;
        private LocalDate actualCompletionDate;
        private String status;
        private int orderIndex;
        private long totalTasks;
        private long completedTasks;
        private int progressPercentage;
        private Instant createdAt;
        private Instant updatedAt;

        public MilestoneResponse() {}

        public MilestoneResponse(UUID milestoneId, UUID projectId, String projectCode, String projectName,
                                 String title, String description, LocalDate targetDate,
                                 LocalDate actualCompletionDate, String status, int orderIndex,
                                 long totalTasks, long completedTasks, int progressPercentage,
                                 Instant createdAt, Instant updatedAt) {
            this.milestoneId = milestoneId;
            this.projectId = projectId;
            this.projectCode = projectCode;
            this.projectName = projectName;
            this.title = title;
            this.description = description;
            this.targetDate = targetDate;
            this.actualCompletionDate = actualCompletionDate;
            this.status = status;
            this.orderIndex = orderIndex;
            this.totalTasks = totalTasks;
            this.completedTasks = completedTasks;
            this.progressPercentage = progressPercentage;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public UUID getMilestoneId() { return milestoneId; }
        public void setMilestoneId(UUID milestoneId) { this.milestoneId = milestoneId; }
        public UUID getProjectId() { return projectId; }
        public void setProjectId(UUID projectId) { this.projectId = projectId; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public LocalDate getTargetDate() { return targetDate; }
        public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
        public LocalDate getActualCompletionDate() { return actualCompletionDate; }
        public void setActualCompletionDate(LocalDate actualCompletionDate) { this.actualCompletionDate = actualCompletionDate; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public int getOrderIndex() { return orderIndex; }
        public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
        public long getTotalTasks() { return totalTasks; }
        public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }
        public long getCompletedTasks() { return completedTasks; }
        public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }
        public int getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(int progressPercentage) { this.progressPercentage = progressPercentage; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class MilestoneStatsResponse {
        private long total;
        private long inProgress;
        private long completed;
        private long pending;
        private long delayed;

        public MilestoneStatsResponse() {}

        public MilestoneStatsResponse(long total, long inProgress, long completed, long pending, long delayed) {
            this.total = total;
            this.inProgress = inProgress;
            this.completed = completed;
            this.pending = pending;
            this.delayed = delayed;
        }

        public long getTotal() { return total; }
        public void setTotal(long total) { this.total = total; }
        public long getInProgress() { return inProgress; }
        public void setInProgress(long inProgress) { this.inProgress = inProgress; }
        public long getCompleted() { return completed; }
        public void setCompleted(long completed) { this.completed = completed; }
        public long getPending() { return pending; }
        public void setPending(long pending) { this.pending = pending; }
        public long getDelayed() { return delayed; }
        public void setDelayed(long delayed) { this.delayed = delayed; }
    }
}
