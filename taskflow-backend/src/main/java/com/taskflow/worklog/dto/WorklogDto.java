package com.taskflow.worklog.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class WorklogDto {

    public static class CreateWorklogRequest {
        @NotNull(message = "Project ID is required")
        private Long projectId;

        private Long taskId;

        private LocalDate logDate = LocalDate.now();

        @NotNull(message = "Hours spent is required")
        @DecimalMin(value = "0.1", message = "Hours spent must be at least 0.1")
        private BigDecimal hoursSpent;

        @NotBlank(message = "Work description is required")
        private String description;

        @JsonProperty("isBillable")
        @JsonAlias({"billable", "is_billable"})
        private Boolean isBillable = true;

        public CreateWorklogRequest() {}

        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }

        public LocalDate getLogDate() { return logDate; }
        public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

        public BigDecimal getHoursSpent() { return hoursSpent; }
        public void setHoursSpent(BigDecimal hoursSpent) { this.hoursSpent = hoursSpent; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        @JsonProperty("isBillable")
        public Boolean getIsBillable() { return isBillable; }

        @JsonProperty("isBillable")
        @JsonAlias({"billable", "is_billable"})
        public void setIsBillable(Boolean isBillable) { this.isBillable = isBillable; }

        public boolean isBillable() { return isBillable != null ? isBillable : true; }
    }

    public static class UpdateWorklogRequest {
        private Long taskId;
        private LocalDate logDate;
        private BigDecimal hoursSpent;
        private String description;

        @JsonProperty("isBillable")
        @JsonAlias({"billable", "is_billable"})
        private Boolean isBillable;

        public UpdateWorklogRequest() {}

        public Long getTaskId() { return taskId; }
        public void setTaskId(Long taskId) { this.taskId = taskId; }

        public LocalDate getLogDate() { return logDate; }
        public void setLogDate(LocalDate logDate) { this.logDate = logDate; }

        public BigDecimal getHoursSpent() { return hoursSpent; }
        public void setHoursSpent(BigDecimal hoursSpent) { this.hoursSpent = hoursSpent; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        @JsonProperty("isBillable")
        public Boolean getIsBillable() { return isBillable; }

        @JsonProperty("isBillable")
        @JsonAlias({"billable", "is_billable"})
        public void setIsBillable(Boolean isBillable) { this.isBillable = isBillable; }
    }

    public static class ReviewWorklogRequest {
        @NotBlank(message = "Review status is required (APPROVED or REJECTED)")
        private String status;

        private String reviewNotes;

        public ReviewWorklogRequest() {}

        public ReviewWorklogRequest(String status, String reviewNotes) {
            this.status = status;
            this.reviewNotes = reviewNotes;
        }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public String getReviewNotes() { return reviewNotes; }
        public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
    }

    public static class WorklogResponse {
        private Long worklogId;
        private Long projectId;
        private String projectCode;
        private String projectName;
        private Long taskId;
        private String taskCode;
        private String taskTitle;
        private Long userId;
        private String userName;
        private String userRoleCategory;
        private LocalDate logDate;
        private BigDecimal hoursSpent;
        private String description;

        @JsonProperty("isBillable")
        private boolean isBillable;

        private String status;
        private Long reviewedById;
        private String reviewedByName;
        private Instant reviewedAt;
        private String reviewNotes;
        private Instant createdAt;

        public WorklogResponse() {}

        public WorklogResponse(Long worklogId, Long projectId, String projectCode, String projectName,
                               Long taskId, String taskCode, String taskTitle, Long userId,
                               String userName, String userRoleCategory, LocalDate logDate,
                               BigDecimal hoursSpent, String description, boolean isBillable,
                               String status, Long reviewedById, String reviewedByName,
                               Instant reviewedAt, String reviewNotes, Instant createdAt) {
            this.worklogId = worklogId;
            this.projectId = projectId;
            this.projectCode = projectCode;
            this.projectName = projectName;
            this.taskId = taskId;
            this.taskCode = taskCode;
            this.taskTitle = taskTitle;
            this.userId = userId;
            this.userName = userName;
            this.userRoleCategory = userRoleCategory;
            this.logDate = logDate;
            this.hoursSpent = hoursSpent;
            this.description = description;
            this.isBillable = isBillable;
            this.status = status;
            this.reviewedById = reviewedById;
            this.reviewedByName = reviewedByName;
            this.reviewedAt = reviewedAt;
            this.reviewNotes = reviewNotes;
            this.createdAt = createdAt;
        }

        public Long getWorklogId() { return worklogId; }
        public void setWorklogId(Long worklogId) { this.worklogId = worklogId; }
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
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getUserRoleCategory() { return userRoleCategory; }
        public void setUserRoleCategory(String userRoleCategory) { this.userRoleCategory = userRoleCategory; }
        public LocalDate getLogDate() { return logDate; }
        public void setLogDate(LocalDate logDate) { this.logDate = logDate; }
        public BigDecimal getHoursSpent() { return hoursSpent; }
        public void setHoursSpent(BigDecimal hoursSpent) { this.hoursSpent = hoursSpent; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        @JsonProperty("isBillable")
        public boolean isBillable() { return isBillable; }
        @JsonProperty("isBillable")
        public void setBillable(boolean billable) { isBillable = billable; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public Long getReviewedById() { return reviewedById; }
        public void setReviewedById(Long reviewedById) { this.reviewedById = reviewedById; }
        public String getReviewedByName() { return reviewedByName; }
        public void setReviewedByName(String reviewedByName) { this.reviewedByName = reviewedByName; }
        public Instant getReviewedAt() { return reviewedAt; }
        public void setReviewedAt(Instant reviewedAt) { this.reviewedAt = reviewedAt; }
        public String getReviewNotes() { return reviewNotes; }
        public void setReviewNotes(String reviewNotes) { this.reviewNotes = reviewNotes; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class TimesheetSummaryResponse {
        private BigDecimal totalHours = BigDecimal.ZERO;
        private BigDecimal billableHours = BigDecimal.ZERO;
        private BigDecimal nonBillableHours = BigDecimal.ZERO;
        private BigDecimal approvedHours = BigDecimal.ZERO;
        private BigDecimal pendingHours = BigDecimal.ZERO;
        private BigDecimal rejectedHours = BigDecimal.ZERO;

        public TimesheetSummaryResponse() {}

        public TimesheetSummaryResponse(BigDecimal totalHours, BigDecimal billableHours,
                                        BigDecimal nonBillableHours, BigDecimal approvedHours,
                                        BigDecimal pendingHours, BigDecimal rejectedHours) {
            this.totalHours = totalHours;
            this.billableHours = billableHours;
            this.nonBillableHours = nonBillableHours;
            this.approvedHours = approvedHours;
            this.pendingHours = pendingHours;
            this.rejectedHours = rejectedHours;
        }

        public BigDecimal getTotalHours() { return totalHours; }
        public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }
        public BigDecimal getBillableHours() { return billableHours; }
        public void setBillableHours(BigDecimal billableHours) { this.billableHours = billableHours; }
        public BigDecimal getNonBillableHours() { return nonBillableHours; }
        public void setNonBillableHours(BigDecimal nonBillableHours) { this.nonBillableHours = nonBillableHours; }
        public BigDecimal getApprovedHours() { return approvedHours; }
        public void setApprovedHours(BigDecimal approvedHours) { this.approvedHours = approvedHours; }
        public BigDecimal getPendingHours() { return pendingHours; }
        public void setPendingHours(BigDecimal pendingHours) { this.pendingHours = pendingHours; }
        public BigDecimal getRejectedHours() { return rejectedHours; }
        public void setRejectedHours(BigDecimal rejectedHours) { this.rejectedHours = rejectedHours; }
    }

    public static class ProductivityReportResponse {
        private BigDecimal totalHours = BigDecimal.ZERO;
        private double billableRate = 0.0;
        private int totalContributors = 0;
        private int totalProjectsTracked = 0;
        private List<DepartmentHoursSummary> departmentBreakdowns = new ArrayList<>();
        private List<ContributorSummary> topContributors = new ArrayList<>();

        public ProductivityReportResponse() {}

        public ProductivityReportResponse(BigDecimal totalHours, double billableRate,
                                          int totalContributors, int totalProjectsTracked,
                                          List<DepartmentHoursSummary> departmentBreakdowns,
                                          List<ContributorSummary> topContributors) {
            this.totalHours = totalHours;
            this.billableRate = billableRate;
            this.totalContributors = totalContributors;
            this.totalProjectsTracked = totalProjectsTracked;
            this.departmentBreakdowns = departmentBreakdowns;
            this.topContributors = topContributors;
        }

        public BigDecimal getTotalHours() { return totalHours; }
        public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }
        public double getBillableRate() { return billableRate; }
        public void setBillableRate(double billableRate) { this.billableRate = billableRate; }
        public int getTotalContributors() { return totalContributors; }
        public void setTotalContributors(int totalContributors) { this.totalContributors = totalContributors; }
        public int getTotalProjectsTracked() { return totalProjectsTracked; }
        public void setTotalProjectsTracked(int totalProjectsTracked) { this.totalProjectsTracked = totalProjectsTracked; }
        public List<DepartmentHoursSummary> getDepartmentBreakdowns() { return departmentBreakdowns; }
        public void setDepartmentBreakdowns(List<DepartmentHoursSummary> departmentBreakdowns) { this.departmentBreakdowns = departmentBreakdowns; }
        public List<ContributorSummary> getTopContributors() { return topContributors; }
        public void setTopContributors(List<ContributorSummary> topContributors) { this.topContributors = topContributors; }
    }

    public static class DepartmentHoursSummary {
        private String roleCategoryCode;
        private String roleCategoryName;
        private BigDecimal totalHours;
        private int employeeCount;

        public DepartmentHoursSummary() {}

        public DepartmentHoursSummary(String roleCategoryCode, String roleCategoryName, BigDecimal totalHours, int employeeCount) {
            this.roleCategoryCode = roleCategoryCode;
            this.roleCategoryName = roleCategoryName;
            this.totalHours = totalHours;
            this.employeeCount = employeeCount;
        }

        public String getRoleCategoryCode() { return roleCategoryCode; }
        public void setRoleCategoryCode(String roleCategoryCode) { this.roleCategoryCode = roleCategoryCode; }
        public String getRoleCategoryName() { return roleCategoryName; }
        public void setRoleCategoryName(String roleCategoryName) { this.roleCategoryName = roleCategoryName; }
        public BigDecimal getTotalHours() { return totalHours; }
        public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }
        public int getEmployeeCount() { return employeeCount; }
        public void setEmployeeCount(int employeeCount) { this.employeeCount = employeeCount; }
    }

    public static class ContributorSummary {
        private Long userId;
        private String userName;
        private String roleCategory;
        private BigDecimal totalHours;
        private BigDecimal billableHours;
        private BigDecimal approvedHours;

        public ContributorSummary() {}

        public ContributorSummary(Long userId, String userName, String roleCategory,
                                  BigDecimal totalHours, BigDecimal billableHours, BigDecimal approvedHours) {
            this.userId = userId;
            this.userName = userName;
            this.roleCategory = roleCategory;
            this.totalHours = totalHours;
            this.billableHours = billableHours;
            this.approvedHours = approvedHours;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getUserName() { return userName; }
        public void setUserName(String userName) { this.userName = userName; }
        public String getRoleCategory() { return roleCategory; }
        public void setRoleCategory(String roleCategory) { this.roleCategory = roleCategory; }
        public BigDecimal getTotalHours() { return totalHours; }
        public void setTotalHours(BigDecimal totalHours) { this.totalHours = totalHours; }
        public BigDecimal getBillableHours() { return billableHours; }
        public void setBillableHours(BigDecimal billableHours) { this.billableHours = billableHours; }
        public BigDecimal getApprovedHours() { return approvedHours; }
        public void setApprovedHours(BigDecimal approvedHours) { this.approvedHours = approvedHours; }
    }
}
