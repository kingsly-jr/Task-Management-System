package com.taskflow.task.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.task.dto.TaskDto;
import com.taskflow.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Task Management", description = "Endpoints for project tasks, subtasks, assignments, comments, and Kanban state transitions")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping("/projects/{projectId}/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Create task for project (Admin or assigned PM)")
    public ResponseEntity<ApiResponse<TaskDto.TaskResponse>> createTask(
            @PathVariable Long projectId,
            @Valid @RequestBody TaskDto.CreateTaskRequest request) {
        TaskDto.TaskResponse response = taskService.createTask(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Task created successfully", response));
    }

    @PostMapping("/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Create task for project (with projectId in body or query)")
    public ResponseEntity<ApiResponse<TaskDto.TaskResponse>> createTaskRoot(
            @RequestParam(required = false) Long projectId,
            @Valid @RequestBody TaskDto.CreateTaskRequest request) {
        Long targetProjectId = projectId != null ? projectId : request.getProjectId();
        if (targetProjectId == null) {
            throw new com.taskflow.common.exception.BadRequestException("projectId is required");
        }
        TaskDto.TaskResponse response = taskService.createTask(targetProjectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Task created successfully", response));
    }

    @GetMapping("/projects/{projectId}/tasks")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get tasks for project with filters")
    public ResponseEntity<ApiResponse<List<TaskDto.TaskResponse>>> getTasksForProject(
            @PathVariable Long projectId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) String search) {
        List<TaskDto.TaskResponse> tasks = taskService.getTasksForProject(projectId, status, priority, assigneeId, search);
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }

    @GetMapping("/projects/{projectId}/tasks/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get task summary statistics for a project")
    public ResponseEntity<ApiResponse<TaskDto.TaskStatsResponse>> getProjectTaskStats(
            @PathVariable Long projectId) {
        TaskDto.TaskStatsResponse stats = taskService.getProjectTaskStats(projectId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/tasks/my-tasks")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get tasks assigned to currently logged-in user")
    public ResponseEntity<ApiResponse<List<TaskDto.TaskResponse>>> getMyTasks(
            @RequestParam(required = false) String status) {
        List<TaskDto.TaskResponse> tasks = taskService.getMyTasks(status);
        return ResponseEntity.ok(ApiResponse.ok(tasks));
    }

    @GetMapping("/tasks/{taskId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get task details including subtasks checklist and comments thread")
    public ResponseEntity<ApiResponse<TaskDto.TaskDetailResponse>> getTaskById(
            @PathVariable Long taskId) {
        TaskDto.TaskDetailResponse detail = taskService.getTaskById(taskId);
        return ResponseEntity.ok(ApiResponse.ok(detail));
    }

    @PutMapping("/tasks/{taskId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update task details, hours, and assignees")
    public ResponseEntity<ApiResponse<TaskDto.TaskResponse>> updateTask(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskDto.UpdateTaskRequest request) {
        TaskDto.TaskResponse response = taskService.updateTask(taskId, request);
        return ResponseEntity.ok(ApiResponse.ok("Task updated successfully", response));
    }

    @PatchMapping("/tasks/{taskId}/status")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update task status (Kanban drag or status dropdown)")
    public ResponseEntity<ApiResponse<TaskDto.TaskResponse>> updateTaskStatus(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> body) {
        String status = body.get("status");
        TaskDto.TaskResponse response = taskService.updateTaskStatus(taskId, status);
        return ResponseEntity.ok(ApiResponse.ok("Task status updated successfully", response));
    }

    @PostMapping("/tasks/{taskId}/subtasks")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Add subtask to checklist")
    public ResponseEntity<ApiResponse<TaskDto.SubtaskResponse>> addSubtask(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskDto.CreateSubtaskRequest request) {
        TaskDto.SubtaskResponse response = taskService.addSubtask(taskId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Subtask added successfully", response));
    }

    @PatchMapping("/tasks/{taskId}/subtasks/{subtaskId}/toggle")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Toggle subtask completion status")
    public ResponseEntity<ApiResponse<TaskDto.SubtaskResponse>> toggleSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId) {
        TaskDto.SubtaskResponse response = taskService.toggleSubtask(taskId, subtaskId);
        return ResponseEntity.ok(ApiResponse.ok("Subtask status updated", response));
    }

    @DeleteMapping("/tasks/{taskId}/subtasks/{subtaskId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Delete subtask")
    public ResponseEntity<ApiResponse<Void>> deleteSubtask(
            @PathVariable Long taskId,
            @PathVariable Long subtaskId) {
        taskService.deleteSubtask(taskId, subtaskId);
        return ResponseEntity.ok(ApiResponse.ok("Subtask removed successfully", null));
    }

    @PostMapping("/tasks/{taskId}/comments")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Post comment to task discussion")
    public ResponseEntity<ApiResponse<TaskDto.CommentResponse>> addComment(
            @PathVariable Long taskId,
            @Valid @RequestBody TaskDto.CreateCommentRequest request) {
        TaskDto.CommentResponse response = taskService.addComment(taskId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Comment added successfully", response));
    }

    @PostMapping("/tasks/{taskId}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Approve completed task (PM or Admin)")
    public ResponseEntity<ApiResponse<TaskDto.TaskResponse>> approveTask(
            @PathVariable Long taskId) {
        TaskDto.TaskResponse response = taskService.approveTask(taskId);
        return ResponseEntity.ok(ApiResponse.ok("Task approved successfully", response));
    }

    @PostMapping("/tasks/{taskId}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Reject completed task with feedback message (PM or Admin)")
    public ResponseEntity<ApiResponse<TaskDto.TaskResponse>> rejectTask(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> body) {
        String message = body.get("message") != null ? body.get("message") : body.get("reason");
        if (message == null || message.isBlank()) {
            throw new com.taskflow.common.exception.BadRequestException("Feedback message is required when requesting changes");
        }
        TaskDto.TaskResponse response = taskService.rejectTask(taskId, message);
        return ResponseEntity.ok(ApiResponse.ok("Task changes requested and returned to member", response));
    }

    @PostMapping(value = "/tasks/{taskId}/submit-for-review", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit task for review with implementation document and deliverable URL")
    public ResponseEntity<ApiResponse<TaskDto.TaskResponse>> submitTaskForReview(
            @PathVariable Long taskId,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "url", required = false) String url,
            @RequestParam(value = "notes", required = false) String notes) {
        TaskDto.TaskResponse response = taskService.submitTaskForReview(taskId, file, url, notes);
        return ResponseEntity.ok(ApiResponse.ok("Task submitted for review successfully", response));
    }

    @GetMapping("/tasks/{taskId}/review-document")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Download implementation document attached to task review")
    public ResponseEntity<Resource> downloadReviewDocument(
            @PathVariable Long taskId) {
        TaskService.TaskDocumentDownload download = taskService.loadReviewDocument(taskId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(download.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + download.getFileName() + "\"")
                .body(download.getResource());
    }
}
