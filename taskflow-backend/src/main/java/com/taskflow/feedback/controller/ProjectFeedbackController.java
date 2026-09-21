package com.taskflow.feedback.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.feedback.dto.FeedbackDto;
import com.taskflow.feedback.service.ProjectFeedbackService;
import com.taskflow.security.UserPrincipal;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Project Feedback", description = "Endpoints for client project completion reviews and ratings")
public class ProjectFeedbackController {

    private final ProjectFeedbackService feedbackService;

    public ProjectFeedbackController(ProjectFeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    @PostMapping("/projects/{projectId}/feedback")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Submit feedback for a completed project (Client only)")
    public ResponseEntity<ApiResponse<FeedbackDto.FeedbackResponse>> submitFeedback(
            @PathVariable Long projectId,
            @Valid @RequestBody FeedbackDto.CreateFeedbackRequest request,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        FeedbackDto.FeedbackResponse response = feedbackService.submitProjectFeedback(projectId, request, principal.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Thank you! Your feedback for this project has been submitted successfully.", response));
    }

    @GetMapping("/projects/{projectId}/feedback")
    @PreAuthorize("hasAnyRole('CLIENT', 'ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Get feedback for a specific project")
    public ResponseEntity<ApiResponse<FeedbackDto.FeedbackResponse>> getFeedback(
            @PathVariable Long projectId,
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        FeedbackDto.FeedbackResponse response = feedbackService.getFeedbackByProject(projectId, principal.getId(), principal.getRoleCode());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/feedbacks/my-feedbacks")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Get all feedbacks submitted by the current authenticated client")
    public ResponseEntity<ApiResponse<List<FeedbackDto.FeedbackResponse>>> getMyFeedbacks(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        List<FeedbackDto.FeedbackResponse> list = feedbackService.getMyFeedbacks(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
