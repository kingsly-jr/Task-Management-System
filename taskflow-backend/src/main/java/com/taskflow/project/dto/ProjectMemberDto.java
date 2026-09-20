package com.taskflow.project.dto;

import jakarta.validation.constraints.NotNull;
import java.time.Instant;

public class ProjectMemberDto {

    public static class AssignMemberRequest {
        @NotNull(message = "User is required")
        private Long userId;

        private Long roleCategoryId;

        public AssignMemberRequest() {}

        public AssignMemberRequest(Long userId, Long roleCategoryId) {
            this.userId = userId;
            this.roleCategoryId = roleCategoryId;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public Long getRoleCategoryId() { return roleCategoryId; }
        public void setRoleCategoryId(Long roleCategoryId) { this.roleCategoryId = roleCategoryId; }
    }

    public static class ProjectMemberResponse {
        private Long projectMemberId;
        private Long userId;
        private String fullName;
        private String email;
        private Long roleCategoryId;
        private String roleCategoryName;
        private Instant assignedAt;
        private String status;

        public ProjectMemberResponse() {}

        public ProjectMemberResponse(Long projectMemberId, Long userId, String fullName, String email,
                                     Long roleCategoryId, String roleCategoryName, Instant assignedAt, String status) {
            this.projectMemberId = projectMemberId;
            this.userId = userId;
            this.fullName = fullName;
            this.email = email;
            this.roleCategoryId = roleCategoryId;
            this.roleCategoryName = roleCategoryName;
            this.assignedAt = assignedAt;
            this.status = status;
        }

        public Long getProjectMemberId() { return projectMemberId; }
        public void setProjectMemberId(Long projectMemberId) { this.projectMemberId = projectMemberId; }
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Long getRoleCategoryId() { return roleCategoryId; }
        public void setRoleCategoryId(Long roleCategoryId) { this.roleCategoryId = roleCategoryId; }
        public String getRoleCategoryName() { return roleCategoryName; }
        public void setRoleCategoryName(String roleCategoryName) { this.roleCategoryName = roleCategoryName; }
        public Instant getAssignedAt() { return assignedAt; }
        public void setAssignedAt(Instant assignedAt) { this.assignedAt = assignedAt; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class AvailableMemberResponse {
        private Long userId;
        private String fullName;
        private String email;
        private Long roleCategoryId;
        private String roleCategoryName;
        private long activeProjectsCount;

        public AvailableMemberResponse() {}

        public AvailableMemberResponse(Long userId, String fullName, String email,
                                       Long roleCategoryId, String roleCategoryName, long activeProjectsCount) {
            this.userId = userId;
            this.fullName = fullName;
            this.email = email;
            this.roleCategoryId = roleCategoryId;
            this.roleCategoryName = roleCategoryName;
            this.activeProjectsCount = activeProjectsCount;
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public Long getRoleCategoryId() { return roleCategoryId; }
        public void setRoleCategoryId(Long roleCategoryId) { this.roleCategoryId = roleCategoryId; }
        public String getRoleCategoryName() { return roleCategoryName; }
        public void setRoleCategoryName(String roleCategoryName) { this.roleCategoryName = roleCategoryName; }
        public long getActiveProjectsCount() { return activeProjectsCount; }
        public void setActiveProjectsCount(long activeProjectsCount) { this.activeProjectsCount = activeProjectsCount; }
    }
}
