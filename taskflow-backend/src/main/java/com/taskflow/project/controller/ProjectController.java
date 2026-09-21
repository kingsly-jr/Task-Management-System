package com.taskflow.project.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.project.dto.ProjectDto;
import com.taskflow.project.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
@Tag(name = "Project Management", description = "Endpoints for managing client projects, budgets, schedules, and leadership")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create project and assign Project Manager (Admin only)")
    public ResponseEntity<ApiResponse<ProjectDto.ProjectResponse>> createProject(
            @Valid @RequestBody ProjectDto.CreateProjectRequest request
    ) {
        ProjectDto.ProjectResponse response = projectService.createProject(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Project created successfully", response));
    }

    @GetMapping
    @Operation(summary = "List projects (Scoped automatically to user's permissions: Admin sees all, PM sees assigned, Client sees own)")
    public ResponseEntity<ApiResponse<List<ProjectDto.ProjectResponse>>> getProjects(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority
    ) {
        List<ProjectDto.ProjectResponse> list = projectService.getProjects(search, status, priority);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get project summary statistics")
    public ResponseEntity<ApiResponse<ProjectDto.ProjectStatsResponse>> getProjectStats() {
        ProjectDto.ProjectStatsResponse stats = projectService.getProjectStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project details by ID with access verification")
    public ResponseEntity<ApiResponse<ProjectDto.ProjectResponse>> getProjectById(@PathVariable Long id) {
        ProjectDto.ProjectResponse response = projectService.getProjectById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update project details, budget, dates or status (Admin only)")
    public ResponseEntity<ApiResponse<ProjectDto.ProjectResponse>> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectDto.UpdateProjectRequest request
    ) {
        ProjectDto.ProjectResponse response = projectService.updateProject(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft delete project (Admin only)")
    public ResponseEntity<ApiResponse<Void>> softDeleteProject(@PathVariable Long id) {
        projectService.softDeleteProject(id);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully", null));
    }
}
