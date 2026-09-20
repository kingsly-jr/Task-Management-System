package com.taskflow.role.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public class RoleCategoryDto {

    public static class CreateRequest {
        @NotBlank(message = "Category name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String roleCategoryName;

        @NotBlank(message = "Category code is required")
        @Pattern(regexp = "^[A-Z0-9_]{2,100}$", message = "Code must be uppercase alphanumeric with underscores (e.g. FULL_STACK_DEVELOPER)")
        private String roleCategoryCode;

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        private String description;

        private String status = "ACTIVE";

        public CreateRequest() {}

        public CreateRequest(String roleCategoryName, String roleCategoryCode, String description, String status) {
            this.roleCategoryName = roleCategoryName;
            this.roleCategoryCode = roleCategoryCode;
            this.description = description;
            this.status = status != null ? status : "ACTIVE";
        }

        public String getRoleCategoryName() { return roleCategoryName; }
        public void setRoleCategoryName(String roleCategoryName) { this.roleCategoryName = roleCategoryName; }
        public String getRoleCategoryCode() { return roleCategoryCode; }
        public void setRoleCategoryCode(String roleCategoryCode) { this.roleCategoryCode = roleCategoryCode; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class UpdateRequest {
        @NotBlank(message = "Category name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String roleCategoryName;

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        private String description;

        private String status;

        public UpdateRequest() {}

        public UpdateRequest(String roleCategoryName, String description, String status) {
            this.roleCategoryName = roleCategoryName;
            this.description = description;
            this.status = status;
        }

        public String getRoleCategoryName() { return roleCategoryName; }
        public void setRoleCategoryName(String roleCategoryName) { this.roleCategoryName = roleCategoryName; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class Response {
        private Long roleCategoryId;
        private String roleCategoryName;
        private String roleCategoryCode;
        private String description;
        private String status;
        private long assignedUsersCount;
        private Instant createdAt;
        private Instant updatedAt;

        public Response() {}

        public Response(Long roleCategoryId, String roleCategoryName, String roleCategoryCode,
                        String description, String status, long assignedUsersCount,
                        Instant createdAt, Instant updatedAt) {
            this.roleCategoryId = roleCategoryId;
            this.roleCategoryName = roleCategoryName;
            this.roleCategoryCode = roleCategoryCode;
            this.description = description;
            this.status = status;
            this.assignedUsersCount = assignedUsersCount;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public Long getRoleCategoryId() { return roleCategoryId; }
        public void setRoleCategoryId(Long roleCategoryId) { this.roleCategoryId = roleCategoryId; }
        public String getRoleCategoryName() { return roleCategoryName; }
        public void setRoleCategoryName(String roleCategoryName) { this.roleCategoryName = roleCategoryName; }
        public String getRoleCategoryCode() { return roleCategoryCode; }
        public void setRoleCategoryCode(String roleCategoryCode) { this.roleCategoryCode = roleCategoryCode; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public long getAssignedUsersCount() { return assignedUsersCount; }
        public void setAssignedUsersCount(long assignedUsersCount) { this.assignedUsersCount = assignedUsersCount; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }
}
