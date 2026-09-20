package com.taskflow.milestone.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.milestone.dto.MilestoneDto;
import com.taskflow.milestone.service.MilestoneService;
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
@Tag(name = "Milestone Management", description = "Endpoints for managing project deliverables, target deadlines, and progress roadmaps")
public class MilestoneController {

    private final MilestoneService milestoneService;

    public MilestoneController(MilestoneService milestoneService) {
        this.milestoneService = milestoneService;
    }

    @PostMapping("/projects/{projectId}/milestones")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Create project milestone (Admin or assigned PM)")
    public ResponseEntity<ApiResponse<MilestoneDto.MilestoneResponse>> createMilestone(
            @PathVariable Long projectId,
            @Valid @RequestBody MilestoneDto.CreateMilestoneRequest request) {
        MilestoneDto.MilestoneResponse response = milestoneService.createMilestone(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Milestone created successfully", response));
    }

    @GetMapping("/projects/{projectId}/milestones")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get all milestones for a project with task completion progress")
    public ResponseEntity<ApiResponse<List<MilestoneDto.MilestoneResponse>>> getMilestonesForProject(
            @PathVariable Long projectId) {
        List<MilestoneDto.MilestoneResponse> response = milestoneService.getMilestonesForProject(projectId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/projects/{projectId}/milestones/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get milestone stats (total, completed, in progress, delayed)")
    public ResponseEntity<ApiResponse<MilestoneDto.MilestoneStatsResponse>> getMilestoneStats(
            @PathVariable Long projectId) {
        MilestoneDto.MilestoneStatsResponse response = milestoneService.getMilestoneStats(projectId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/milestones/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get milestone details by ID")
    public ResponseEntity<ApiResponse<MilestoneDto.MilestoneResponse>> getMilestoneById(
            @PathVariable Long id) {
        MilestoneDto.MilestoneResponse response = milestoneService.getMilestoneById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/milestones/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Update milestone details and status")
    public ResponseEntity<ApiResponse<MilestoneDto.MilestoneResponse>> updateMilestone(
            @PathVariable Long id,
            @Valid @RequestBody MilestoneDto.UpdateMilestoneRequest request) {
        MilestoneDto.MilestoneResponse response = milestoneService.updateMilestone(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Milestone updated successfully", response));
    }

    @DeleteMapping("/milestones/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Delete milestone")
    public ResponseEntity<ApiResponse<Void>> deleteMilestone(@PathVariable Long id) {
        milestoneService.deleteMilestone(id);
        return ResponseEntity.ok(ApiResponse.ok("Milestone deleted successfully", null));
    }
}
