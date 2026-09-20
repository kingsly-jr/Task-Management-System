package com.taskflow.task.service;

import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
import com.taskflow.project.entity.Project;
import com.taskflow.project.repository.ProjectMemberRepository;
import com.taskflow.project.repository.ProjectRepository;
import com.taskflow.security.UserPrincipal;
import com.taskflow.task.dto.TaskDto;
import com.taskflow.task.entity.Subtask;
import com.taskflow.task.entity.Task;
import com.taskflow.task.entity.TaskComment;
import com.taskflow.task.repository.SubtaskRepository;
import com.taskflow.milestone.entity.Milestone;
import com.taskflow.milestone.repository.MilestoneRepository;
import com.taskflow.task.repository.TaskCommentRepository;
import com.taskflow.task.repository.TaskRepository;
import com.taskflow.user.entity.User;
import com.taskflow.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final SubtaskRepository subtaskRepository;
    private final TaskCommentRepository taskCommentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final MilestoneRepository milestoneRepository;

    public TaskService(TaskRepository taskRepository,
                       SubtaskRepository subtaskRepository,
                       TaskCommentRepository taskCommentRepository,
                       ProjectRepository projectRepository,
                       ProjectMemberRepository projectMemberRepository,
                       UserRepository userRepository,
                       MilestoneRepository milestoneRepository) {
        this.taskRepository = taskRepository;
        this.subtaskRepository = subtaskRepository;
        this.taskCommentRepository = taskCommentRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.milestoneRepository = milestoneRepository;
    }

    @Transactional
    public TaskDto.TaskResponse createTask(UUID projectId, TaskDto.CreateTaskRequest request) {
        Project project = getProjectAndVerifyManageAccess(projectId);
        UserPrincipal currentUser = getCurrentUserPrincipal();
        User author = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Current user not found"));

        // Validate and gather assignees (must be active members of this project)
        Set<User> assignees = new HashSet<>();
        if (request.getAssigneeIds() != null) {
            for (UUID assigneeId : request.getAssigneeIds()) {
                boolean isMember = projectMemberRepository
                        .existsByProject_ProjectIdAndUser_UserIdAndStatus(projectId, assigneeId, "ACTIVE");
                if (!isMember) {
                    throw new BadRequestException("User with ID " + assigneeId + " is not an active team member allocated to this project");
                }
                User memberUser = userRepository.findById(assigneeId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + assigneeId));
                assignees.add(memberUser);
            }
        }

        // Auto-generate task code e.g. PRJ-0001-T01
        long count = taskRepository.countByProject_ProjectIdAndIsDeletedFalse(projectId);
        String taskCode = String.format("%s-T%02d", project.getProjectCode(), count + 1);
        while (taskRepository.existsByTaskCodeIgnoreCaseAndIsDeletedFalse(taskCode)) {
            count++;
            taskCode = String.format("%s-T%02d", project.getProjectCode(), count + 1);
        }

        Milestone milestone = null;
        if (request.getMilestoneId() != null) {
            milestone = milestoneRepository.findById(request.getMilestoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + request.getMilestoneId()));
            if (!milestone.getProject().getProjectId().equals(projectId)) {
                throw new BadRequestException("Milestone does not belong to this project");
            }
        }

        Task task = Task.builder()
                .project(project)
                .milestone(milestone)
                .taskCode(taskCode)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .status("TODO")
                .priority(request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM")
                .estimatedHours(request.getEstimatedHours())
                .startDate(request.getStartDate())
                .dueDate(request.getDueDate())
                .createdBy(author)
                .assignees(assignees)
                .isDeleted(false)
                .build();

        Task saved = taskRepository.save(task);
        recalculateProjectProgress(project);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<TaskDto.TaskResponse> getTasksForProject(UUID projectId, String status, String priority, UUID assigneeId, String search) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(project, currentUser);

        List<Task> tasks = taskRepository.findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(projectId);

        return tasks.stream()
                .filter(t -> {
                    boolean matchStatus = status == null || status.isBlank() || "ALL".equalsIgnoreCase(status) ||
                            t.getStatus().equalsIgnoreCase(status);
                    boolean matchPriority = priority == null || priority.isBlank() || "ALL".equalsIgnoreCase(priority) ||
                            t.getPriority().equalsIgnoreCase(priority);
                    boolean matchAssignee = assigneeId == null ||
                            t.getAssignees().stream().anyMatch(a -> a.getUserId().equals(assigneeId));
                    boolean matchSearch = search == null || search.isBlank() ||
                            t.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                            t.getTaskCode().toLowerCase().contains(search.toLowerCase());
                    return matchStatus && matchPriority && matchAssignee && matchSearch;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TaskDto.TaskResponse> getMyTasks(String status) {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        List<Task> tasks;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            tasks = taskRepository.findByAssigneeUserIdAndStatus(currentUser.getId(), status.toUpperCase());
        } else {
            tasks = taskRepository.findByAssigneeUserId(currentUser.getId());
        }
        return tasks.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskDto.TaskDetailResponse getTaskById(UUID taskId) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(task.getProject(), currentUser);

        TaskDto.TaskResponse base = mapToResponse(task);
        TaskDto.TaskDetailResponse detail = new TaskDto.TaskDetailResponse();
        copyProperties(base, detail);

        List<Subtask> subtasks = subtaskRepository.findByTask_TaskIdOrderByCreatedAtAsc(taskId);
        detail.setSubtasks(subtasks.stream().map(s -> new TaskDto.SubtaskResponse(
                s.getSubtaskId(),
                s.getTitle(),
                s.isCompleted(),
                s.getCreatedAt()
        )).collect(Collectors.toList()));

        List<TaskComment> comments = taskCommentRepository.findByTask_TaskIdOrderByCreatedAtAsc(taskId);
        detail.setComments(comments.stream().map(c -> new TaskDto.CommentResponse(
                c.getCommentId(),
                c.getUser().getUserId(),
                c.getUser().getFirstName() + " " + c.getUser().getLastName(),
                c.getContent(),
                c.getCreatedAt()
        )).collect(Collectors.toList()));

        return detail;
    }

    @Transactional
    public TaskDto.TaskResponse updateTask(UUID taskId, TaskDto.UpdateTaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyTaskEditAccess(task, currentUser);

        task.setTitle(request.getTitle().trim());
        task.setDescription(request.getDescription());
        if (request.getPriority() != null) task.setPriority(request.getPriority().toUpperCase());
        if (request.getStatus() != null) task.setStatus(request.getStatus().toUpperCase());
        if (request.getEstimatedHours() != null) task.setEstimatedHours(request.getEstimatedHours());
        if (request.getLoggedHours() != null) task.setLoggedHours(request.getLoggedHours());
        task.setStartDate(request.getStartDate());
        task.setDueDate(request.getDueDate());

        if (request.getMilestoneId() != null) {
            Milestone milestone = milestoneRepository.findById(request.getMilestoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + request.getMilestoneId()));
            if (!milestone.getProject().getProjectId().equals(task.getProject().getProjectId())) {
                throw new BadRequestException("Milestone does not belong to this project");
            }
            task.setMilestone(milestone);
        }

        // Update assignees if provided and user is PM/Admin
        if (request.getAssigneeIds() != null && hasManagementAccess(task.getProject(), currentUser)) {
            Set<User> assignees = new HashSet<>();
            for (UUID assigneeId : request.getAssigneeIds()) {
                boolean isMember = projectMemberRepository
                        .existsByProject_ProjectIdAndUser_UserIdAndStatus(task.getProject().getProjectId(), assigneeId, "ACTIVE");
                if (!isMember) {
                    throw new BadRequestException("User " + assigneeId + " is not an active team member of this project");
                }
                User memberUser = userRepository.findById(assigneeId)
                        .orElseThrow(() -> new ResourceNotFoundException("User not found: " + assigneeId));
                assignees.add(memberUser);
            }
            task.setAssignees(assignees);
        }

        Task updated = taskRepository.save(task);
        recalculateProjectProgress(task.getProject());
        return mapToResponse(updated);
    }

    @Transactional
    public TaskDto.TaskResponse updateTaskStatus(UUID taskId, String newStatus) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyTaskEditAccess(task, currentUser);

        task.setStatus(newStatus.toUpperCase().trim());
        Task updated = taskRepository.save(task);
        recalculateProjectProgress(task.getProject());
        return mapToResponse(updated);
    }

    @Transactional
    public TaskDto.SubtaskResponse addSubtask(UUID taskId, TaskDto.CreateSubtaskRequest request) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyTaskEditAccess(task, currentUser);

        Subtask subtask = Subtask.builder()
                .task(task)
                .title(request.getTitle().trim())
                .isCompleted(false)
                .build();

        Subtask saved = subtaskRepository.save(subtask);
        return new TaskDto.SubtaskResponse(saved.getSubtaskId(), saved.getTitle(), saved.isCompleted(), saved.getCreatedAt());
    }

    @Transactional
    public TaskDto.SubtaskResponse toggleSubtask(UUID taskId, UUID subtaskId) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Subtask not found with id: " + subtaskId));

        if (!subtask.getTask().getTaskId().equals(taskId)) {
            throw new BadRequestException("Subtask does not belong to the specified task");
        }

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyTaskEditAccess(subtask.getTask(), currentUser);

        subtask.setCompleted(!subtask.isCompleted());
        Subtask saved = subtaskRepository.save(subtask);
        return new TaskDto.SubtaskResponse(saved.getSubtaskId(), saved.getTitle(), saved.isCompleted(), saved.getCreatedAt());
    }

    @Transactional
    public void deleteSubtask(UUID taskId, UUID subtaskId) {
        Subtask subtask = subtaskRepository.findById(subtaskId)
                .orElseThrow(() -> new ResourceNotFoundException("Subtask not found with id: " + subtaskId));

        if (!subtask.getTask().getTaskId().equals(taskId)) {
            throw new BadRequestException("Subtask does not belong to the specified task");
        }

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyTaskEditAccess(subtask.getTask(), currentUser);

        subtaskRepository.delete(subtask);
    }

    @Transactional
    public TaskDto.CommentResponse addComment(UUID taskId, TaskDto.CreateCommentRequest request) {
        Task task = taskRepository.findById(taskId)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(task.getProject(), currentUser);

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        TaskComment comment = TaskComment.builder()
                .task(task)
                .user(user)
                .content(request.getContent().trim())
                .build();

        TaskComment saved = taskCommentRepository.save(comment);
        return new TaskDto.CommentResponse(
                saved.getCommentId(),
                user.getUserId(),
                user.getFirstName() + " " + user.getLastName(),
                saved.getContent(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public TaskDto.TaskStatsResponse getProjectTaskStats(UUID projectId) {
        long total = taskRepository.countByProject_ProjectIdAndIsDeletedFalse(projectId);
        long todo = taskRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "TODO");
        long inProgress = taskRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "IN_PROGRESS");
        long inReview = taskRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "IN_REVIEW");
        long blocked = taskRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "BLOCKED");
        long completed = taskRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "COMPLETED");
        return new TaskDto.TaskStatsResponse(total, todo, inProgress, inReview, blocked, completed);
    }

    private void recalculateProjectProgress(Project project) {
        long total = taskRepository.countByProject_ProjectIdAndIsDeletedFalse(project.getProjectId());
        if (total == 0) {
            project.setProgress(0);
        } else {
            long completed = taskRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(project.getProjectId(), "COMPLETED");
            int progress = (int) Math.round(((double) completed / total) * 100);
            project.setProgress(progress);
        }
        projectRepository.save(project);
    }

    private Project getProjectAndVerifyManageAccess(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        if (!hasManagementAccess(project, currentUser)) {
            throw new AccessDeniedException("Only an Administrator or the assigned Project Manager can create or manage tasks for this project");
        }
        return project;
    }

    private boolean hasManagementAccess(Project project, UserPrincipal user) {
        if ("ADMIN".equalsIgnoreCase(user.getRoleCode())) return true;
        return "PROJECT_MANAGER".equalsIgnoreCase(user.getRoleCode()) &&
                project.getProjectManager().getUserId().equals(user.getId());
    }

    private void verifyTaskEditAccess(Task task, UserPrincipal currentUser) {
        if (hasManagementAccess(task.getProject(), currentUser)) return;

        // Assigned team member can edit status/hours/checklists
        boolean isAssignee = task.getAssignees().stream()
                .anyMatch(a -> a.getUserId().equals(currentUser.getId()));
        if (isAssignee) return;

        throw new AccessDeniedException("You do not have permission to modify this task");
    }

    private void verifyProjectViewAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRoleCode();
        UUID userId = currentUser.getId();

        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            if (!project.getProjectManager().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have permission to view tasks of projects managed by another PM");
            }
            return;
        }

        if ("CLIENT".equalsIgnoreCase(role)) {
            if (project.getClient().getUser() == null || !project.getClient().getUser().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have permission to view tasks of projects belonging to other clients");
            }
            return;
        }

        // TEAM_MEMBER check
        boolean isMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserIdAndStatus(project.getProjectId(), userId, "ACTIVE");
        if (!isMember) {
            throw new AccessDeniedException("You are not an assigned member of this project");
        }
    }

    private UserPrincipal getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User not authenticated");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    private TaskDto.TaskResponse mapToResponse(Task task) {
        long subtasksCount = subtaskRepository.countByTask_TaskId(task.getTaskId());
        long completedSubtasks = subtaskRepository.countByTask_TaskIdAndIsCompletedTrue(task.getTaskId());

        List<TaskDto.AssigneeSummary> assignees = task.getAssignees().stream()
                .map(a -> new TaskDto.AssigneeSummary(
                        a.getUserId(),
                        a.getFirstName() + " " + a.getLastName(),
                        a.getEmail(),
                        a.getRoleCategory() != null ? a.getRoleCategory().getRoleCategoryName() : "General"
                ))
                .collect(Collectors.toList());

        TaskDto.TaskResponse response = new TaskDto.TaskResponse(
                task.getTaskId(),
                task.getProject().getProjectId(),
                task.getProject().getProjectCode(),
                task.getProject().getProjectName(),
                task.getTaskCode(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getPriority(),
                task.getEstimatedHours(),
                task.getLoggedHours(),
                task.getStartDate(),
                task.getDueDate(),
                subtasksCount,
                completedSubtasks,
                assignees,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
        if (task.getMilestone() != null) {
            response.setMilestoneId(task.getMilestone().getMilestoneId());
            response.setMilestoneTitle(task.getMilestone().getTitle());
        }
        return response;
    }

    private void copyProperties(TaskDto.TaskResponse src, TaskDto.TaskDetailResponse dest) {
        dest.setTaskId(src.getTaskId());
        dest.setProjectId(src.getProjectId());
        dest.setProjectCode(src.getProjectCode());
        dest.setProjectName(src.getProjectName());
        dest.setTaskCode(src.getTaskCode());
        dest.setTitle(src.getTitle());
        dest.setDescription(src.getDescription());
        dest.setStatus(src.getStatus());
        dest.setPriority(src.getPriority());
        dest.setEstimatedHours(src.getEstimatedHours());
        dest.setLoggedHours(src.getLoggedHours());
        dest.setStartDate(src.getStartDate());
        dest.setDueDate(src.getDueDate());
        dest.setMilestoneId(src.getMilestoneId());
        dest.setMilestoneTitle(src.getMilestoneTitle());
        dest.setSubtasksCount(src.getSubtasksCount());
        dest.setCompletedSubtasksCount(src.getCompletedSubtasksCount());
        dest.setAssignees(src.getAssignees());
        dest.setCreatedAt(src.getCreatedAt());
        dest.setUpdatedAt(src.getUpdatedAt());
    }
}
