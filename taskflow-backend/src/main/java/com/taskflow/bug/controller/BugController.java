package com.taskflow.bug.controller;

import com.taskflow.bug.dto.BugDto;
import com.taskflow.bug.service.BugService;
import com.taskflow.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Bug & Defect Management", description = "Endpoints for QA bug reporting, triage, developer resolution, and retest verification")
public class BugController {

    private final BugService bugService;

    public BugController(BugService bugService) {
        this.bugService = bugService;
    }

    @PostMapping("/projects/{projectId}/bugs")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER')")
    @Operation(summary = "Report defect/bug for a project")
    public ResponseEntity<ApiResponse<BugDto.BugResponse>> createBug(
            @PathVariable Long projectId,
            @Valid @RequestBody BugDto.CreateBugRequest request) {
        BugDto.BugResponse response = bugService.createBug(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Bug reported successfully", response));
    }

    @GetMapping("/projects/{projectId}/bugs")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get all bugs for project with filtering")
    public ResponseEntity<ApiResponse<List<BugDto.BugResponse>>> getBugsForProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) Long assignedToId,
            @RequestParam(required = false) String search) {
        List<BugDto.BugResponse> list = bugService.getBugsForProject(projectId, status, severity, assignedToId, search);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/projects/{projectId}/bugs/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get bug summary metrics and status distribution")
    public ResponseEntity<ApiResponse<BugDto.BugStatsResponse>> getBugStats(
            @PathVariable Long projectId) {
        BugDto.BugStatsResponse stats = bugService.getBugStats(projectId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/bugs/my-bugs")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER')")
    @Operation(summary = "Get bugs assigned to or reported by the current user")
    public ResponseEntity<ApiResponse<List<BugDto.BugResponse>>> getMyBugs(
            @RequestParam(required = false, defaultValue = "ASSIGNED") String filter) {
        List<BugDto.BugResponse> list = bugService.getMyBugs(filter);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/bugs/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get detailed bug information including activity thread")
    public ResponseEntity<ApiResponse<BugDto.BugDetailResponse>> getBugById(@PathVariable Long id) {
        BugDto.BugDetailResponse response = bugService.getBugById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/bugs/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Assign bug to a project team developer (PM or Admin)")
    public ResponseEntity<ApiResponse<BugDto.BugResponse>> assignBug(
            @PathVariable Long id,
            @Valid @RequestBody BugDto.AssignBugRequest request) {
        BugDto.BugResponse response = bugService.assignBug(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Bug assigned successfully", response));
    }

    @PatchMapping("/bugs/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER')")
    @Operation(summary = "Update bug status (e.g. IN_PROGRESS, RESOLVED, UNDER_RETEST)")
    public ResponseEntity<ApiResponse<BugDto.BugResponse>> updateBugStatus(
            @PathVariable Long id,
            @Valid @RequestBody BugDto.UpdateBugStatusRequest request) {
        BugDto.BugResponse response = bugService.updateBugStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Bug status updated", response));
    }

    @PostMapping("/bugs/{id}/resolve")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER')")
    @Operation(summary = "Developer resolves bug with fix description notes")
    public ResponseEntity<ApiResponse<BugDto.BugResponse>> resolveBug(
            @PathVariable Long id,
            @Valid @RequestBody BugDto.ResolveBugRequest request) {
        BugDto.BugResponse response = bugService.resolveBug(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Bug marked as RESOLVED", response));
    }

    @PostMapping("/bugs/{id}/retest")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER')")
    @Operation(summary = "QA verifies fix: pass marks CLOSED, fail marks REOPENED")
    public ResponseEntity<ApiResponse<BugDto.BugResponse>> retestBug(
            @PathVariable Long id,
            @Valid @RequestBody BugDto.RetestBugRequest request) {
        BugDto.BugResponse response = bugService.retestBug(id, request);
        String msg = request.isPassed() ? "Bug verified and CLOSED" : "Bug retest failed and REOPENED";
        return ResponseEntity.ok(ApiResponse.ok(msg, response));
    }

    @PostMapping("/bugs/{id}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER')")
    @Operation(summary = "Post comment to bug discussion thread")
    public ResponseEntity<ApiResponse<BugDto.BugCommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody BugDto.CreateBugCommentRequest request) {
        BugDto.BugCommentResponse response = bugService.addComment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Comment added", response));
    }
}
