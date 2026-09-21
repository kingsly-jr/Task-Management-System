package com.taskflow.project.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
/**
 * Data Transfer Objects for Project management, financial tracking, and metrics.
 */
public class ProjectDto {

    public static class CreateProjectRequest {
        private String projectCode;

        @NotBlank(message = "Project name is required")
        @Size(min = 2, max = 150)
        private String projectName;

        private String description;

        @NotNull(message = "Client is required")
        private Long clientId;

        @NotNull(message = "Project Manager is required")
        private Long projectManagerId;

        @NotNull(message = "Start date is required")
        private LocalDate startDate;

        @NotNull(message = "Expected end date is required")
        private LocalDate expectedEndDate;

        private BigDecimal budget;
        private BigDecimal paidAmount;
        private BigDecimal remainingAmount;
        private String priority = "MEDIUM";
        private String status = "PLANNING";
        private String technologyStack;

        public CreateProjectRequest() {}

        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getClientId() { return clientId; }
        public void setClientId(Long clientId) { this.clientId = clientId; }
        public Long getProjectManagerId() { return projectManagerId; }
        public void setProjectManagerId(Long projectManagerId) { this.projectManagerId = projectManagerId; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getExpectedEndDate() { return expectedEndDate; }
        public void setExpectedEndDate(LocalDate expectedEndDate) { this.expectedEndDate = expectedEndDate; }
        public BigDecimal getBudget() { return budget; }
        public void setBudget(BigDecimal budget) { this.budget = budget; }
        public BigDecimal getPaidAmount() { return paidAmount; }
        public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
        public BigDecimal getRemainingAmount() { return remainingAmount; }
        public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getTechnologyStack() { return technologyStack; }
        public void setTechnologyStack(String technologyStack) { this.technologyStack = technologyStack; }
    }

    public static class UpdateProjectRequest {
        @NotBlank(message = "Project name is required")
        private String projectName;

        private String description;
        private Long projectManagerId;
        private LocalDate startDate;
        private LocalDate expectedEndDate;
        private LocalDate actualEndDate;
        private BigDecimal budget;
        private BigDecimal paidAmount;
        private BigDecimal remainingAmount;
        private String priority;
        private String status;
        private Integer progress;
        private String technologyStack;

        public UpdateProjectRequest() {}

        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getProjectManagerId() { return projectManagerId; }
        public void setProjectManagerId(Long projectManagerId) { this.projectManagerId = projectManagerId; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getExpectedEndDate() { return expectedEndDate; }
        public void setExpectedEndDate(LocalDate expectedEndDate) { this.expectedEndDate = expectedEndDate; }
        public LocalDate getActualEndDate() { return actualEndDate; }
        public void setActualEndDate(LocalDate actualEndDate) { this.actualEndDate = actualEndDate; }
        public BigDecimal getBudget() { return budget; }
        public void setBudget(BigDecimal budget) { this.budget = budget; }
        public BigDecimal getPaidAmount() { return paidAmount; }
        public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
        public BigDecimal getRemainingAmount() { return remainingAmount; }
        public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getProgress() { return progress; }
        public void setProgress(Integer progress) { this.progress = progress; }
        public String getTechnologyStack() { return technologyStack; }
        public void setTechnologyStack(String technologyStack) { this.technologyStack = technologyStack; }
    }

    public static class ProjectResponse {
        private Long projectId;
        private String projectCode;
        private String projectName;
        private String description;

        private Long clientId;
        private String clientCompanyName;
        private String clientContactPerson;
        private String clientEmail;

        private Long projectManagerId;
        private String projectManagerName;
        private String projectManagerEmail;

        private LocalDate startDate;
        private LocalDate expectedEndDate;
        private LocalDate actualEndDate;
        private BigDecimal budget;
        private BigDecimal paidAmount;
        private BigDecimal remainingAmount;
        private String priority;
        private String status;
        private Integer progress;
        private String technologyStack;
        private long teamMembersCount;
        private Instant createdAt;
        private Instant updatedAt;

        public ProjectResponse() {}

        public ProjectResponse(Long projectId, String projectCode, String projectName, String description,
                               Long clientId, String clientCompanyName, String clientContactPerson, String clientEmail,
                               Long projectManagerId, String projectManagerName, String projectManagerEmail,
                               LocalDate startDate, LocalDate expectedEndDate, LocalDate actualEndDate,
                               BigDecimal budget, BigDecimal paidAmount, BigDecimal remainingAmount,
                               String priority, String status, Integer progress,
                               String technologyStack, long teamMembersCount, Instant createdAt, Instant updatedAt) {
            this.projectId = projectId;
            this.projectCode = projectCode;
            this.projectName = projectName;
            this.description = description;
            this.clientId = clientId;
            this.clientCompanyName = clientCompanyName;
            this.clientContactPerson = clientContactPerson;
            this.clientEmail = clientEmail;
            this.projectManagerId = projectManagerId;
            this.projectManagerName = projectManagerName;
            this.projectManagerEmail = projectManagerEmail;
            this.startDate = startDate;
            this.expectedEndDate = expectedEndDate;
            this.actualEndDate = actualEndDate;
            this.budget = budget;
            this.paidAmount = paidAmount;
            this.remainingAmount = remainingAmount;
            this.priority = priority;
            this.status = status;
            this.progress = progress;
            this.technologyStack = technologyStack;
            this.teamMembersCount = teamMembersCount;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Long getClientId() { return clientId; }
        public void setClientId(Long clientId) { this.clientId = clientId; }
        public String getClientCompanyName() { return clientCompanyName; }
        public void setClientCompanyName(String clientCompanyName) { this.clientCompanyName = clientCompanyName; }
        public String getClientContactPerson() { return clientContactPerson; }
        public void setClientContactPerson(String clientContactPerson) { this.clientContactPerson = clientContactPerson; }
        public String getClientEmail() { return clientEmail; }
        public void setClientEmail(String clientEmail) { this.clientEmail = clientEmail; }
        public Long getProjectManagerId() { return projectManagerId; }
        public void setProjectManagerId(Long projectManagerId) { this.projectManagerId = projectManagerId; }
        public String getProjectManagerName() { return projectManagerName; }
        public void setProjectManagerName(String projectManagerName) { this.projectManagerName = projectManagerName; }
        public String getProjectManagerEmail() { return projectManagerEmail; }
        public void setProjectManagerEmail(String projectManagerEmail) { this.projectManagerEmail = projectManagerEmail; }
        public LocalDate getStartDate() { return startDate; }
        public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
        public LocalDate getExpectedEndDate() { return expectedEndDate; }
        public void setExpectedEndDate(LocalDate expectedEndDate) { this.expectedEndDate = expectedEndDate; }
        public LocalDate getActualEndDate() { return actualEndDate; }
        public void setActualEndDate(LocalDate actualEndDate) { this.actualEndDate = actualEndDate; }
        public BigDecimal getBudget() { return budget; }
        public void setBudget(BigDecimal budget) { this.budget = budget; }
        public BigDecimal getPaidAmount() { return paidAmount; }
        public void setPaidAmount(BigDecimal paidAmount) { this.paidAmount = paidAmount; }
        public BigDecimal getRemainingAmount() { return remainingAmount; }
        public void setRemainingAmount(BigDecimal remainingAmount) { this.remainingAmount = remainingAmount; }
        public String getPriority() { return priority; }
        public void setPriority(String priority) { this.priority = priority; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Integer getProgress() { return progress; }
        public void setProgress(Integer progress) { this.progress = progress; }
        public String getTechnologyStack() { return technologyStack; }
        public void setTechnologyStack(String technologyStack) { this.technologyStack = technologyStack; }
        public long getTeamMembersCount() { return teamMembersCount; }
        public void setTeamMembersCount(long teamMembersCount) { this.teamMembersCount = teamMembersCount; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class ProjectStatsResponse {
        private long totalProjects;
        private long activeProjects;
        private long completedProjects;
        private long planningProjects;

        public ProjectStatsResponse() {}

        public ProjectStatsResponse(long totalProjects, long activeProjects, long completedProjects, long planningProjects) {
            this.totalProjects = totalProjects;
            this.activeProjects = activeProjects;
            this.completedProjects = completedProjects;
            this.planningProjects = planningProjects;
        }

        public long getTotalProjects() { return totalProjects; }
        public void setTotalProjects(long totalProjects) { this.totalProjects = totalProjects; }
        public long getActiveProjects() { return activeProjects; }
        public void setActiveProjects(long activeProjects) { this.activeProjects = activeProjects; }
        public long getCompletedProjects() { return completedProjects; }
        public void setCompletedProjects(long completedProjects) { this.completedProjects = completedProjects; }
        public long getPlanningProjects() { return planningProjects; }
        public void setPlanningProjects(long planningProjects) { this.planningProjects = planningProjects; }
    }
}
