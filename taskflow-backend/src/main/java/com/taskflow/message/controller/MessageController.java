package com.taskflow.message.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.message.dto.MessageDto;
import com.taskflow.message.service.MessageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/messages")
@Tag(name = "Project Messaging Hub", description = "Endpoints for channel-based project collaboration, client communication, and team discussions")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Post a message to a project channel")
    public ResponseEntity<ApiResponse<MessageDto.MessageResponse>> sendMessage(
            @PathVariable Long projectId,
            @Valid @RequestBody MessageDto.SendMessageRequest request) {

        MessageDto.MessageResponse response = messageService.sendMessage(projectId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Message sent", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get messages for a project channel with client confidentiality filtering")
    public ResponseEntity<ApiResponse<List<MessageDto.MessageResponse>>> getMessages(
            @PathVariable Long projectId,
            @RequestParam(required = false, defaultValue = "GENERAL") String channel) {

        List<MessageDto.MessageResponse> list = messageService.getMessages(projectId, channel);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
