package com.taskflow.changerequest.controller;

import com.taskflow.changerequest.dto.ChangeRequestDto;
import com.taskflow.changerequest.service.ChangeRequestService;
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
@Tag(name = "Change Request Management", description = "Endpoints for client change requests, scope adjustments, cost/schedule impact analysis, and review")
public class ChangeRequestController {

    private final ChangeRequestService changeRequestService;

    public ChangeRequestController(ChangeRequestService changeRequestService) {
        this.changeRequestService = changeRequestService;
    }

    @PostMapping("/projects/{projectId}/change-requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'CLIENT')")
    @Operation(summary = "Submit a new change request for a project")
    public ResponseEntity<ApiResponse<ChangeRequestDto.ChangeRequestResponse>> createChangeRequest(
            @PathVariable Long projectId,
            @Valid @RequestBody ChangeRequestDto.CreateChangeRequest request) {
        ChangeRequestDto.ChangeRequestResponse response = changeRequestService.createChangeRequest(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Change request submitted successfully", response));
    }

    @GetMapping("/projects/{projectId}/change-requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get all change requests for a project with optional status filter and search")
    public ResponseEntity<ApiResponse<List<ChangeRequestDto.ChangeRequestResponse>>> getChangeRequestsForProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        List<ChangeRequestDto.ChangeRequestResponse> list = changeRequestService.getChangeRequestsForProject(projectId, status, search);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/change-requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get change requests with optional projectId filter")
    public ResponseEntity<ApiResponse<List<ChangeRequestDto.ChangeRequestResponse>>> getChangeRequests(
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        if (projectId != null) {
            List<ChangeRequestDto.ChangeRequestResponse> list = changeRequestService.getChangeRequestsForProject(projectId, status, search);
            return ResponseEntity.ok(ApiResponse.ok(list));
        }
        return ResponseEntity.ok(ApiResponse.ok(List.of()));
    }

    @GetMapping("/projects/{projectId}/change-requests/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'CLIENT')")
    @Operation(summary = "Get aggregated change request metrics, cost impact, and schedule impact")
    public ResponseEntity<ApiResponse<ChangeRequestDto.ChangeRequestStatsResponse>> getStats(
            @PathVariable Long projectId) {
        ChangeRequestDto.ChangeRequestStatsResponse stats = changeRequestService.getStats(projectId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/change-requests/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get detailed change request information including negotiation thread")
    public ResponseEntity<ApiResponse<ChangeRequestDto.ChangeRequestDetailResponse>> getChangeRequestById(
            @PathVariable Long id) {
        ChangeRequestDto.ChangeRequestDetailResponse response = changeRequestService.getChangeRequestById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/change-requests/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Review change request: Approve or Reject with notes (PM or Admin)")
    public ResponseEntity<ApiResponse<ChangeRequestDto.ChangeRequestResponse>> reviewChangeRequest(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRequestDto.ReviewChangeRequest request) {
        ChangeRequestDto.ChangeRequestResponse response = changeRequestService.reviewChangeRequest(id, request);
        String msg = request.isApproved() ? "Change request APPROVED" : "Change request REJECTED";
        return ResponseEntity.ok(ApiResponse.ok(msg, response));
    }

    @PatchMapping("/change-requests/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Update change request status (e.g. UNDER_REVIEW, IMPLEMENTED)")
    public ResponseEntity<ApiResponse<ChangeRequestDto.ChangeRequestResponse>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRequestDto.UpdateStatusRequest request) {
        ChangeRequestDto.ChangeRequestResponse response = changeRequestService.updateStatus(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Change request status updated", response));
    }

    @PostMapping("/change-requests/{id}/comments")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'CLIENT', 'TEAM_MEMBER')")
    @Operation(summary = "Post a comment to the change request discussion thread")
    public ResponseEntity<ApiResponse<ChangeRequestDto.CommentResponse>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody ChangeRequestDto.CreateCommentRequest request) {
        ChangeRequestDto.CommentResponse response = changeRequestService.addComment(id, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Comment added", response));
    }
}
