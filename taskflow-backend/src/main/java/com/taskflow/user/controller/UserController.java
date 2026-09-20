package com.taskflow.user.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.user.dto.UserDto;
import com.taskflow.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "Endpoints for managing company employees, Project Managers, and Team Members")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/managers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Project Manager (Admin only)")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> createProjectManager(
            @Valid @RequestBody UserDto.CreateManagerRequest request
    ) {
        UserDto.UserResponse response = userService.createProjectManager(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Project Manager created successfully", response));
    }

    @PostMapping("/team-members")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Team Member (Admin only)")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> createTeamMember(
            @Valid @RequestBody UserDto.CreateTeamMemberRequest request
    ) {
        UserDto.UserResponse response = userService.createTeamMember(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Team Member created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "List company users with search and filtering")
    public ResponseEntity<ApiResponse<UserDto.UserPageResponse>> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String roleCode,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        UserDto.UserPageResponse response = userService.getUsers(search, roleCode, status, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get user summary statistics (Admin only)")
    public ResponseEntity<ApiResponse<UserDto.UserStatsResponse>> getUserStats() {
        UserDto.UserStatsResponse stats = userService.getUserStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> getUserById(@PathVariable UUID id) {
        UserDto.UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update user details (Admin only)")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> updateUser(
            @PathVariable UUID id,
            @Valid @RequestBody UserDto.UpdateUserRequest request
    ) {
        UserDto.UserResponse response = userService.updateUser(id, request);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle user active/inactive status (Admin only)")
    public ResponseEntity<ApiResponse<UserDto.UserResponse>> toggleUserStatus(@PathVariable UUID id) {
        UserDto.UserResponse response = userService.toggleUserStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("User status changed to " + response.getStatus(), response));
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset user password with temporary credentials (Admin only)")
    public ResponseEntity<ApiResponse<Map<String, String>>> resetUserPassword(
            @PathVariable UUID id,
            @RequestBody(required = false) UserDto.ResetPasswordAdminRequest request
    ) {
        String tempPassword = userService.resetUserPassword(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully", Map.of(
                "temporaryPassword", tempPassword,
                "message", "Temporary password generated. User will be forced to change it on next login."
        )));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft delete user (Admin only)")
    public ResponseEntity<ApiResponse<Void>> softDeleteUser(@PathVariable UUID id) {
        userService.softDeleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully", null));
    }
}
