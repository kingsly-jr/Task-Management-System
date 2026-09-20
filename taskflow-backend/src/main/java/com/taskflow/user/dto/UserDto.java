package com.taskflow.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class UserDto {

    public static class CreateManagerRequest {
        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 100)
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 100)
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;
        private String temporaryPassword;

        public CreateManagerRequest() {}

        public CreateManagerRequest(String firstName, String lastName, String email, String phone, String temporaryPassword) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.phone = phone;
            this.temporaryPassword = temporaryPassword;
        }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getTemporaryPassword() { return temporaryPassword; }
        public void setTemporaryPassword(String temporaryPassword) { this.temporaryPassword = temporaryPassword; }
    }

    public static class CreateTeamMemberRequest {
        @NotBlank(message = "First name is required")
        @Size(min = 2, max = 100)
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(min = 2, max = 100)
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;

        @NotNull(message = "Role category ID is required")
        private Long roleCategoryId;

        private String temporaryPassword;

        public CreateTeamMemberRequest() {}

        public CreateTeamMemberRequest(String firstName, String lastName, String email, String phone, Long roleCategoryId, String temporaryPassword) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.email = email;
            this.phone = phone;
            this.roleCategoryId = roleCategoryId;
            this.temporaryPassword = temporaryPassword;
        }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public Long getRoleCategoryId() { return roleCategoryId; }
        public void setRoleCategoryId(Long roleCategoryId) { this.roleCategoryId = roleCategoryId; }
        public String getTemporaryPassword() { return temporaryPassword; }
        public void setTemporaryPassword(String temporaryPassword) { this.temporaryPassword = temporaryPassword; }
    }

    public static class UpdateUserRequest {
        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        private String phone;
        private Long roleCategoryId;
        private String status;

        public UpdateUserRequest() {}

        public UpdateUserRequest(String firstName, String lastName, String phone, Long roleCategoryId, String status) {
            this.firstName = firstName;
            this.lastName = lastName;
            this.phone = phone;
            this.roleCategoryId = roleCategoryId;
            this.status = status;
        }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public Long getRoleCategoryId() { return roleCategoryId; }
        public void setRoleCategoryId(Long roleCategoryId) { this.roleCategoryId = roleCategoryId; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    public static class ResetPasswordAdminRequest {
        private String newTemporaryPassword;

        public ResetPasswordAdminRequest() {}
        public ResetPasswordAdminRequest(String newTemporaryPassword) {
            this.newTemporaryPassword = newTemporaryPassword;
        }

        public String getNewTemporaryPassword() { return newTemporaryPassword; }
        public void setNewTemporaryPassword(String newTemporaryPassword) { this.newTemporaryPassword = newTemporaryPassword; }
    }

    public static class UserResponse {
        private UUID userId;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String phone;
        private String role;
        private Long roleCategoryId;
        private String roleCategoryName;
        private String roleCategoryCode;
        private String status;
        private boolean isFirstLogin;
        private Instant createdAt;
        private Instant updatedAt;

        public UserResponse() {}

        public UserResponse(UUID userId, String email, String firstName, String lastName,
                            String fullName, String phone, String role, Long roleCategoryId,
                            String roleCategoryName, String roleCategoryCode, String status,
                            boolean isFirstLogin, Instant createdAt, Instant updatedAt) {
            this.userId = userId;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
            this.fullName = fullName;
            this.phone = phone;
            this.role = role;
            this.roleCategoryId = roleCategoryId;
            this.roleCategoryName = roleCategoryName;
            this.roleCategoryCode = roleCategoryCode;
            this.status = status;
            this.isFirstLogin = isFirstLogin;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public Long getRoleCategoryId() { return roleCategoryId; }
        public void setRoleCategoryId(Long roleCategoryId) { this.roleCategoryId = roleCategoryId; }
        public String getRoleCategoryName() { return roleCategoryName; }
        public void setRoleCategoryName(String roleCategoryName) { this.roleCategoryName = roleCategoryName; }
        public String getRoleCategoryCode() { return roleCategoryCode; }
        public void setRoleCategoryCode(String roleCategoryCode) { this.roleCategoryCode = roleCategoryCode; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public boolean isFirstLogin() { return isFirstLogin; }
        public void setFirstLogin(boolean firstLogin) { isFirstLogin = firstLogin; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class UserStatsResponse {
        private long totalUsers;
        private long totalManagers;
        private long totalTeamMembers;
        private long inactiveUsers;

        public UserStatsResponse() {}
        public UserStatsResponse(long totalUsers, long totalManagers, long totalTeamMembers, long inactiveUsers) {
            this.totalUsers = totalUsers;
            this.totalManagers = totalManagers;
            this.totalTeamMembers = totalTeamMembers;
            this.inactiveUsers = inactiveUsers;
        }

        public long getTotalUsers() { return totalUsers; }
        public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }
        public long getTotalManagers() { return totalManagers; }
        public void setTotalManagers(long totalManagers) { this.totalManagers = totalManagers; }
        public long getTotalTeamMembers() { return totalTeamMembers; }
        public void setTotalTeamMembers(long totalTeamMembers) { this.totalTeamMembers = totalTeamMembers; }
        public long getInactiveUsers() { return inactiveUsers; }
        public void setInactiveUsers(long inactiveUsers) { this.inactiveUsers = inactiveUsers; }
    }

    public static class UserPageResponse {
        private List<UserResponse> content;
        private int pageNo;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean last;

        public UserPageResponse() {}
        public UserPageResponse(List<UserResponse> content, int pageNo, int pageSize, long totalElements, int totalPages, boolean last) {
            this.content = content;
            this.pageNo = pageNo;
            this.pageSize = pageSize;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.last = last;
        }

        public List<UserResponse> getContent() { return content; }
        public void setContent(List<UserResponse> content) { this.content = content; }
        public int getPageNo() { return pageNo; }
        public void setPageNo(int pageNo) { this.pageNo = pageNo; }
        public int getPageSize() { return pageSize; }
        public void setPageSize(int pageSize) { this.pageSize = pageSize; }
        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
        public boolean isLast() { return last; }
        public void setLast(boolean last) { this.last = last; }
    }
}
