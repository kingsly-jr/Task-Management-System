package com.taskflow.auth.dto;

import java.util.UUID;

public class UserSummaryDto {
    private UUID userId;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String role;
    private String roleCategory;
    private boolean isFirstLogin;
    private String status;

    public UserSummaryDto() {}

    public UserSummaryDto(UUID userId, String email, String firstName, String lastName,
                          String fullName, String role, String roleCategory, boolean isFirstLogin, String status) {
        this.userId = userId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = fullName;
        this.role = role;
        this.roleCategory = roleCategory;
        this.isFirstLogin = isFirstLogin;
        this.status = status;
    }

    public static UserSummaryDtoBuilder builder() {
        return new UserSummaryDtoBuilder();
    }

    public static class UserSummaryDtoBuilder {
        private UUID userId;
        private String email;
        private String firstName;
        private String lastName;
        private String fullName;
        private String role;
        private String roleCategory;
        private boolean isFirstLogin;
        private String status;

        public UserSummaryDtoBuilder userId(UUID userId) { this.userId = userId; return this; }
        public UserSummaryDtoBuilder email(String email) { this.email = email; return this; }
        public UserSummaryDtoBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public UserSummaryDtoBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public UserSummaryDtoBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public UserSummaryDtoBuilder role(String role) { this.role = role; return this; }
        public UserSummaryDtoBuilder roleCategory(String roleCategory) { this.roleCategory = roleCategory; return this; }
        public UserSummaryDtoBuilder isFirstLogin(boolean isFirstLogin) { this.isFirstLogin = isFirstLogin; return this; }
        public UserSummaryDtoBuilder status(String status) { this.status = status; return this; }

        public UserSummaryDto build() {
            return new UserSummaryDto(userId, email, firstName, lastName, fullName, role, roleCategory, isFirstLogin, status);
        }
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
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getRoleCategory() { return roleCategory; }
    public void setRoleCategory(String roleCategory) { this.roleCategory = roleCategory; }
    public boolean isFirstLogin() { return isFirstLogin; }
    public void setFirstLogin(boolean firstLogin) { isFirstLogin = firstLogin; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
