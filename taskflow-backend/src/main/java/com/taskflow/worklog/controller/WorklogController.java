package com.taskflow.worklog.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.worklog.dto.WorklogDto;
import com.taskflow.worklog.service.WorklogService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class WorklogController {

    private final WorklogService worklogService;

    public WorklogController(WorklogService worklogService) {
        this.worklogService = worklogService;
    }

    @PostMapping("/worklogs")
    public ResponseEntity<ApiResponse<WorklogDto.WorklogResponse>> createWorklog(
            @Valid @RequestBody WorklogDto.CreateWorklogRequest request) {
        WorklogDto.WorklogResponse res = worklogService.createWorklog(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Worklog logged successfully", res));
    }

    @PutMapping("/worklogs/{id}")
    public ResponseEntity<ApiResponse<WorklogDto.WorklogResponse>> updateWorklog(
            @PathVariable("id") Long worklogId,
            @RequestBody WorklogDto.UpdateWorklogRequest request) {
        WorklogDto.WorklogResponse res = worklogService.updateWorklog(worklogId, request);
        return ResponseEntity.ok(ApiResponse.ok("Worklog updated successfully", res));
    }

    @DeleteMapping("/worklogs/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteWorklog(@PathVariable("id") Long worklogId) {
        worklogService.deleteWorklog(worklogId);
        return ResponseEntity.ok(ApiResponse.ok("Worklog deleted successfully", null));
    }

    @GetMapping("/worklogs/my")
    public ResponseEntity<ApiResponse<List<WorklogDto.WorklogResponse>>> getMyWorklogs(
            @RequestParam(name = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<WorklogDto.WorklogResponse> list = worklogService.getMyWorklogs(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/worklogs/summary")
    public ResponseEntity<ApiResponse<WorklogDto.TimesheetSummaryResponse>> getMyTimesheetSummary() {
        WorklogDto.TimesheetSummaryResponse summary = worklogService.getMyTimesheetSummary();
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/projects/{projectId}/worklogs")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<List<WorklogDto.WorklogResponse>>> getProjectWorklogs(
            @PathVariable("projectId") Long projectId,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "userId", required = false) Long userId) {
        List<WorklogDto.WorklogResponse> list = worklogService.getProjectWorklogs(projectId, status, userId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/worklogs/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<ApiResponse<WorklogDto.WorklogResponse>> reviewWorklog(
            @PathVariable("id") Long worklogId,
            @Valid @RequestBody WorklogDto.ReviewWorklogRequest request) {
        WorklogDto.WorklogResponse res = worklogService.reviewWorklog(worklogId, request);
        return ResponseEntity.ok(ApiResponse.ok("Timesheet entry reviewed successfully", res));
    }
}
