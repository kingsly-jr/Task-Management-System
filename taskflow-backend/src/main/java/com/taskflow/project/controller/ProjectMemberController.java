package com.taskflow.project.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.project.dto.ProjectMemberDto;
import com.taskflow.project.service.ProjectMemberService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/members")
public class ProjectMemberController {

    private final ProjectMemberService projectMemberService;

    public ProjectMemberController(ProjectMemberService projectMemberService) {
        this.projectMemberService = projectMemberService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<ProjectMemberDto.ProjectMemberResponse>> assignMember(
            @PathVariable UUID projectId,
            @Valid @RequestBody ProjectMemberDto.AssignMemberRequest request) {
        ProjectMemberDto.ProjectMemberResponse response = projectMemberService.assignMember(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Team member assigned to project successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    public ResponseEntity<ApiResponse<List<ProjectMemberDto.ProjectMemberResponse>>> getProjectMembers(
            @PathVariable UUID projectId) {
        List<ProjectMemberDto.ProjectMemberResponse> members = projectMemberService.getProjectMembers(projectId);
        return ResponseEntity.ok(ApiResponse.ok(members));
    }

    @DeleteMapping("/{memberId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable UUID projectId,
            @PathVariable UUID memberId) {
        projectMemberService.removeMember(projectId, memberId);
        return ResponseEntity.ok(ApiResponse.ok("Team member removed from project successfully", null));
    }

    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<List<ProjectMemberDto.AvailableMemberResponse>>> getAvailableMembers(
            @PathVariable UUID projectId) {
        List<ProjectMemberDto.AvailableMemberResponse> available = projectMemberService.getAvailableMembers(projectId);
        return ResponseEntity.ok(ApiResponse.ok(available));
    }
}
