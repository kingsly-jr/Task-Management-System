package com.taskflow.message.service;

import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
import com.taskflow.message.dto.MessageDto;
import com.taskflow.message.entity.ProjectMessage;
import com.taskflow.message.repository.ProjectMessageRepository;
import com.taskflow.notification.service.NotificationService;
import com.taskflow.project.entity.Project;
import com.taskflow.project.repository.ProjectMemberRepository;
import com.taskflow.project.repository.ProjectRepository;
import com.taskflow.security.UserPrincipal;
import com.taskflow.user.entity.User;
import com.taskflow.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final ProjectMessageRepository messageRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public MessageService(ProjectMessageRepository messageRepository,
                          ProjectRepository projectRepository,
                          ProjectMemberRepository projectMemberRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.messageRepository = messageRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public MessageDto.MessageResponse sendMessage(Long projectId, MessageDto.SendMessageRequest request) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectChatAccess(project, currentUser);

        User sender = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean isClient = "CLIENT".equalsIgnoreCase(currentUser.getRoleCode());
        boolean clientVisible = isClient || request.isClientVisible();
        String channel = (request.getChannel() != null && !request.getChannel().isBlank())
                ? request.getChannel().toUpperCase().trim()
                : "GENERAL";

        ProjectMessage msg = ProjectMessage.builder()
                .project(project)
                .channel(channel)
                .sender(sender)
                .content(request.getContent().trim())
                .isClientVisible(clientVisible)
                .isDeleted(false)
                .build();

        ProjectMessage saved = messageRepository.save(msg);

        // Notify counterparty
        String preview = request.getContent().length() > 60
                ? request.getContent().substring(0, 57) + "..."
                : request.getContent();

        if (isClient) {
            // Client sent message -> Notify Project Manager
            if (project.getProjectManager() != null) {
                notificationService.createNotification(
                        project.getProjectManager(),
                        sender,
                        "New message from " + sender.getFirstName() + " " + sender.getLastName() + " (" + project.getProjectCode() + ")",
                        preview,
                        "NEW_MESSAGE",
                        "/manager/messages"
                );
            }
        } else if ("PROJECT_MANAGER".equalsIgnoreCase(currentUser.getRoleCode())) {
            // PM sent message -> Notify Client if visible
            if (clientVisible && project.getClient() != null && project.getClient().getUser() != null) {
                notificationService.createNotification(
                        project.getClient().getUser(),
                        sender,
                        "New message from Project Manager (" + project.getProjectCode() + ")",
                        preview,
                        "NEW_MESSAGE",
                        "/client/messages"
                );
            }
        }

        return mapToDto(saved);
    }

    @Transactional(readOnly = true)
    public List<MessageDto.MessageResponse> getMessages(Long projectId, String channel) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectChatAccess(project, currentUser);

        boolean isClient = "CLIENT".equalsIgnoreCase(currentUser.getRoleCode());
        String targetChannel = (channel != null && !channel.isBlank() && !"ALL".equalsIgnoreCase(channel))
                ? channel.toUpperCase().trim()
                : null;

        List<ProjectMessage> list;
        if (isClient) {
            if (targetChannel != null) {
                list = messageRepository.findByProject_ProjectIdAndChannelAndIsClientVisibleTrueAndIsDeletedFalseOrderByCreatedAtAsc(projectId, targetChannel);
            } else {
                list = messageRepository.findByProject_ProjectIdAndIsClientVisibleTrueAndIsDeletedFalseOrderByCreatedAtAsc(projectId);
            }
        } else {
            if (targetChannel != null) {
                list = messageRepository.findByProject_ProjectIdAndChannelAndIsDeletedFalseOrderByCreatedAtAsc(projectId, targetChannel);
            } else {
                list = messageRepository.findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtAsc(projectId);
            }
        }

        return list.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private void verifyProjectChatAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRoleCode();
        Long userId = currentUser.getId();

        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            if (!project.getProjectManager().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not manage this project");
            }
            return;
        }

        if ("CLIENT".equalsIgnoreCase(role)) {
            if (project.getClient().getUser() == null || !project.getClient().getUser().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have messaging access to this project");
            }
            return;
        }

        boolean isMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserIdAndStatus(
                project.getProjectId(), userId, "ACTIVE");
        if (!isMember) {
            throw new AccessDeniedException("You are not an active member of this project team");
        }
    }

    private UserPrincipal getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User not authenticated");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    private MessageDto.MessageResponse mapToDto(ProjectMessage msg) {
        String role = msg.getSender().getRole() != null ? msg.getSender().getRole().getRoleName() : "MEMBER";
        return new MessageDto.MessageResponse(
                msg.getMessageId(),
                msg.getProject().getProjectId(),
                msg.getProject().getProjectCode(),
                msg.getChannel(),
                msg.getContent(),
                msg.isClientVisible(),
                msg.getSender().getUserId(),
                msg.getSender().getFirstName() + " " + msg.getSender().getLastName(),
                role,
                msg.getCreatedAt()
        );
    }
}
