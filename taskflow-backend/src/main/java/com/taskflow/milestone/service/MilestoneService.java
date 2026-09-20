package com.taskflow.milestone.service;

import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
import com.taskflow.milestone.dto.MilestoneDto;
import com.taskflow.milestone.entity.Milestone;
import com.taskflow.milestone.repository.MilestoneRepository;
import com.taskflow.project.entity.Project;
import com.taskflow.project.repository.ProjectMemberRepository;
import com.taskflow.project.repository.ProjectRepository;
import com.taskflow.security.UserPrincipal;
import com.taskflow.task.entity.Task;
import com.taskflow.task.repository.TaskRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MilestoneService {

    private final MilestoneRepository milestoneRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;

    public MilestoneService(MilestoneRepository milestoneRepository,
                            ProjectRepository projectRepository,
                            ProjectMemberRepository projectMemberRepository,
                            TaskRepository taskRepository) {
        this.milestoneRepository = milestoneRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.taskRepository = taskRepository;
    }

    @Transactional
    public MilestoneDto.MilestoneResponse createMilestone(Long projectId, MilestoneDto.CreateMilestoneRequest request) {
        Project project = getProjectAndVerifyManageAccess(projectId);

        Milestone milestone = Milestone.builder()
                .project(project)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .targetDate(request.getTargetDate())
                .status("PENDING")
                .orderIndex(request.getOrderIndex())
                .isDeleted(false)
                .build();

        Milestone saved = milestoneRepository.save(milestone);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MilestoneDto.MilestoneResponse> getMilestonesForProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(project, currentUser);

        List<Milestone> list = milestoneRepository
                .findByProject_ProjectIdAndIsDeletedFalseOrderByOrderIndexAscTargetDateAsc(projectId);

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MilestoneDto.MilestoneResponse getMilestoneById(Long id) {
        Milestone milestone = milestoneRepository.findById(id)
                .filter(m -> !m.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + id));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(milestone.getProject(), currentUser);

        return mapToResponse(milestone);
    }

    @Transactional
    public MilestoneDto.MilestoneResponse updateMilestone(Long id, MilestoneDto.UpdateMilestoneRequest request) {
        Milestone milestone = milestoneRepository.findById(id)
                .filter(m -> !m.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + id));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        if (!hasManagementAccess(milestone.getProject(), currentUser)) {
            throw new AccessDeniedException("Only the assigned Project Manager or Admin can modify this milestone");
        }

        milestone.setTitle(request.getTitle().trim());
        milestone.setDescription(request.getDescription());
        milestone.setTargetDate(request.getTargetDate());
        milestone.setOrderIndex(request.getOrderIndex());

        if (request.getStatus() != null) {
            String newStatus = request.getStatus().toUpperCase().trim();
            milestone.setStatus(newStatus);
            if ("COMPLETED".equals(newStatus) && milestone.getActualCompletionDate() == null) {
                milestone.setActualCompletionDate(LocalDate.now());
            }
        }
        if (request.getActualCompletionDate() != null) {
            milestone.setActualCompletionDate(request.getActualCompletionDate());
        }

        Milestone updated = milestoneRepository.save(milestone);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteMilestone(Long id) {
        Milestone milestone = milestoneRepository.findById(id)
                .filter(m -> !m.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Milestone not found with id: " + id));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        if (!hasManagementAccess(milestone.getProject(), currentUser)) {
            throw new AccessDeniedException("Only the assigned Project Manager or Admin can delete this milestone");
        }

        // Unlink any tasks linked to this milestone
        List<Task> tasks = taskRepository.findByMilestone_MilestoneIdAndIsDeletedFalseOrderByCreatedAtAsc(id);
        for (Task t : tasks) {
            t.setMilestone(null);
            taskRepository.save(t);
        }

        milestone.setDeleted(true);
        milestone.setDeletedAt(Instant.now());
        milestoneRepository.save(milestone);
    }

    @Transactional(readOnly = true)
    public MilestoneDto.MilestoneStatsResponse getMilestoneStats(Long projectId) {
        long total = milestoneRepository.countByProject_ProjectIdAndIsDeletedFalse(projectId);
        long inProgress = milestoneRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "IN_PROGRESS");
        long completed = milestoneRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "COMPLETED");
        long pending = milestoneRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "PENDING");
        long delayed = milestoneRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "DELAYED");

        return new MilestoneDto.MilestoneStatsResponse(total, inProgress, completed, pending, delayed);
    }

    private MilestoneDto.MilestoneResponse mapToResponse(Milestone m) {
        long totalTasks = taskRepository.countByMilestone_MilestoneIdAndIsDeletedFalse(m.getMilestoneId());
        long completedTasks = taskRepository.countByMilestone_MilestoneIdAndStatusAndIsDeletedFalse(m.getMilestoneId(), "COMPLETED");

        int progress = totalTasks > 0 ? (int) Math.round(((double) completedTasks / totalTasks) * 100) : 0;

        String displayStatus = m.getStatus();
        if (!"COMPLETED".equalsIgnoreCase(displayStatus) && m.getTargetDate().isBefore(LocalDate.now())) {
            displayStatus = "DELAYED";
        }

        return new MilestoneDto.MilestoneResponse(
                m.getMilestoneId(),
                m.getProject().getProjectId(),
                m.getProject().getProjectCode(),
                m.getProject().getProjectName(),
                m.getTitle(),
                m.getDescription(),
                m.getTargetDate(),
                m.getActualCompletionDate(),
                displayStatus,
                m.getOrderIndex(),
                totalTasks,
                completedTasks,
                progress,
                m.getCreatedAt(),
                m.getUpdatedAt()
        );
    }

    private Project getProjectAndVerifyManageAccess(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        if (!hasManagementAccess(project, currentUser)) {
            throw new AccessDeniedException("Only an Administrator or the assigned Project Manager can manage milestones for this project");
        }
        return project;
    }

    private boolean hasManagementAccess(Project project, UserPrincipal user) {
        if ("ADMIN".equalsIgnoreCase(user.getRoleCode())) return true;
        return "PROJECT_MANAGER".equalsIgnoreCase(user.getRoleCode()) &&
                project.getProjectManager().getUserId().equals(user.getId());
    }

    private void verifyProjectViewAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRoleCode();
        Long userId = currentUser.getId();

        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            if (!project.getProjectManager().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have permission to view milestones of projects managed by another PM");
            }
            return;
        }

        if ("CLIENT".equalsIgnoreCase(role)) {
            if (project.getClient().getUser() == null || !project.getClient().getUser().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have permission to view milestones of projects belonging to other clients");
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
}
