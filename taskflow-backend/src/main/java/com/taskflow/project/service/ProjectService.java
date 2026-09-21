package com.taskflow.project.service;

import com.taskflow.client.entity.Client;
import com.taskflow.client.repository.ClientRepository;
import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
import com.taskflow.project.dto.ProjectDto;
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

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;

    public ProjectService(ProjectRepository projectRepository,
                          ClientRepository clientRepository,
                          UserRepository userRepository,
                          ProjectMemberRepository projectMemberRepository) {
        this.projectRepository = projectRepository;
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
    }

    @Transactional
    public ProjectDto.ProjectResponse createProject(ProjectDto.CreateProjectRequest request) {
        // 1. Validate dates
        if (request.getExpectedEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("Expected end date cannot be earlier than start date");
        }

        // 2. Validate Client
        Client client = clientRepository.findById(request.getClientId())
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + request.getClientId()));

        if (!"ACTIVE".equalsIgnoreCase(client.getStatus())) {
            throw new BadRequestException("Cannot assign inactive client organization");
        }

        // 3. Validate Project Manager
        User pm = userRepository.findById(request.getProjectManagerId())
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project Manager not found with id: " + request.getProjectManagerId()));

        if (!"PROJECT_MANAGER".equalsIgnoreCase(pm.getRole().getRoleCode())) {
            throw new BadRequestException("Selected user is not a Project Manager (Role: " + pm.getRole().getRoleCode() + ")");
        }

        if (!"ACTIVE".equalsIgnoreCase(pm.getStatus())) {
            throw new BadRequestException("Selected Project Manager account is currently inactive");
        }

        // 4. Generate or validate unique Project Code
        String code = request.getProjectCode();
        if (code == null || code.isBlank()) {
            long count = projectRepository.count();
            code = String.format("PRJ-%04d", count + 1);
            while (projectRepository.existsByProjectCodeIgnoreCaseAndIsDeletedFalse(code)) {
                count++;
                code = String.format("PRJ-%04d", count + 1);
            }
        } else {
            code = code.toUpperCase().trim();
            if (projectRepository.existsByProjectCodeIgnoreCaseAndIsDeletedFalse(code)) {
                throw new BadRequestException("Project with code '" + code + "' already exists");
            }
        }

        BigDecimal budget = request.getBudget();
        BigDecimal paid = request.getPaidAmount() != null ? request.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal remaining = request.getRemainingAmount();
        if (remaining == null && budget != null) {
            remaining = budget.subtract(paid);
            if (remaining.compareTo(BigDecimal.ZERO) < 0) {
                remaining = BigDecimal.ZERO;
            }
        }

        Project project = Project.builder()
                .projectCode(code)
                .projectName(request.getProjectName().trim())
                .description(request.getDescription())
                .client(client)
                .projectManager(pm)
                .startDate(request.getStartDate())
                .expectedEndDate(request.getExpectedEndDate())
                .budget(budget)
                .paidAmount(paid)
                .remainingAmount(remaining)
                .priority(request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM")
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "PLANNING")
                .progress(0)
                .technologyStack(request.getTechnologyStack())
                .isDeleted(false)
                .build();

        Project saved = projectRepository.save(project);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ProjectDto.ProjectResponse> getProjects(String search, String status, String priority) {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        String role = currentUser.getRoleCode();
        Long userId = currentUser.getId();

        List<Project> list;

        if ("ADMIN".equalsIgnoreCase(role)) {
            list = projectRepository.findByIsDeletedFalse();
        } else if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            // Strict PM Isolation: Only projects assigned to this PM
            list = projectRepository.findByProjectManager_UserIdAndIsDeletedFalse(userId);
        } else if ("CLIENT".equalsIgnoreCase(role)) {
            // Strict Client Isolation: Only projects belonging to this Client
            list = projectRepository.findByClient_User_UserIdAndIsDeletedFalse(userId);
        } else {
            // TEAM_MEMBER: projects where they are an active member
            list = projectMemberRepository.findByUser_UserIdAndStatus(userId, "ACTIVE").stream()
                    .map(m -> m.getProject())
                    .filter(p -> !p.isDeleted())
                    .distinct()
                    .collect(Collectors.toList());
        }

        return list.stream()
                .filter(p -> {
                    boolean matchSearch = search == null || search.isBlank() ||
                            p.getProjectName().toLowerCase().contains(search.toLowerCase()) ||
                            p.getProjectCode().toLowerCase().contains(search.toLowerCase()) ||
                            p.getClient().getCompanyName().toLowerCase().contains(search.toLowerCase());
                    boolean matchStatus = status == null || status.isBlank() || "ALL".equalsIgnoreCase(status) ||
                            p.getStatus().equalsIgnoreCase(status);
                    boolean matchPriority = priority == null || priority.isBlank() || "ALL".equalsIgnoreCase(priority) ||
                            p.getPriority().equalsIgnoreCase(priority);
                    return matchSearch && matchStatus && matchPriority;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto.ProjectResponse getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectAccess(project, currentUser);

        return mapToResponse(project);
    }

    @Transactional
    public ProjectDto.ProjectResponse updateProject(Long id, ProjectDto.UpdateProjectRequest request) {
        Project project = projectRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        // Only Admin or the assigned PM can update
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRoleCode()) &&
            !project.getProjectManager().getUserId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only the assigned Project Manager or an Administrator can update this project");
        }

        if (request.getStartDate() != null && request.getExpectedEndDate() != null) {
            if (request.getExpectedEndDate().isBefore(request.getStartDate())) {
                throw new BadRequestException("Expected end date cannot be earlier than start date");
            }
            project.setStartDate(request.getStartDate());
            project.setExpectedEndDate(request.getExpectedEndDate());
        }

        project.setProjectName(request.getProjectName().trim());
        project.setDescription(request.getDescription());
        project.setActualEndDate(request.getActualEndDate());
        if (request.getBudget() != null) {
            project.setBudget(request.getBudget());
        }
        if (request.getPaidAmount() != null) {
            project.setPaidAmount(request.getPaidAmount());
        }
        if (request.getRemainingAmount() != null) {
            project.setRemainingAmount(request.getRemainingAmount());
        } else if (project.getBudget() != null) {
            BigDecimal paidAmt = project.getPaidAmount() != null ? project.getPaidAmount() : BigDecimal.ZERO;
            BigDecimal autoRemaining = project.getBudget().subtract(paidAmt);
            project.setRemainingAmount(autoRemaining.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : autoRemaining);
        }
        if (request.getPriority() != null) project.setPriority(request.getPriority().toUpperCase().trim());
        if (request.getStatus() != null) project.setStatus(request.getStatus().toUpperCase().trim());
        if (request.getProgress() != null) project.setProgress(Math.max(0, Math.min(100, request.getProgress())));
        project.setTechnologyStack(request.getTechnologyStack());

        // Admin can reassign Project Manager
        if ("ADMIN".equalsIgnoreCase(currentUser.getRoleCode()) && request.getProjectManagerId() != null) {
            User newPm = userRepository.findById(request.getProjectManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project Manager not found"));
            project.setProjectManager(newPm);
        }

        Project updated = projectRepository.save(project);
        return mapToResponse(updated);
    }

    @Transactional
    public void softDeleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));

        project.setDeleted(true);
        project.setDeletedAt(Instant.now());
        project.setStatus("CANCELLED");
        projectRepository.save(project);
    }

    @Transactional(readOnly = true)
    public ProjectDto.ProjectStatsResponse getProjectStats() {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        String role = currentUser.getRoleCode();
        Long userId = currentUser.getId();

        if ("ADMIN".equalsIgnoreCase(role)) {
            long total = projectRepository.countByIsDeletedFalse();
            long active = projectRepository.countByStatusAndIsDeletedFalse("IN_PROGRESS");
            long completed = projectRepository.countByStatusAndIsDeletedFalse("COMPLETED");
            long planning = projectRepository.countByStatusAndIsDeletedFalse("PLANNING");
            return new ProjectDto.ProjectStatsResponse(total, active, completed, planning);
        } else if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            long total = projectRepository.countByProjectManager_UserIdAndIsDeletedFalse(userId);
            long active = projectRepository.countByProjectManager_UserIdAndStatusAndIsDeletedFalse(userId, "IN_PROGRESS");
            long completed = projectRepository.countByProjectManager_UserIdAndStatusAndIsDeletedFalse(userId, "COMPLETED");
            long planning = projectRepository.countByProjectManager_UserIdAndStatusAndIsDeletedFalse(userId, "PLANNING");
            return new ProjectDto.ProjectStatsResponse(total, active, completed, planning);
        } else if ("TEAM_MEMBER".equalsIgnoreCase(role)) {
            List<Project> memberProjects = projectMemberRepository.findByUser_UserIdAndStatus(userId, "ACTIVE").stream()
                    .map(m -> m.getProject())
                    .filter(p -> !p.isDeleted())
                    .distinct()
                    .collect(Collectors.toList());
            long total = memberProjects.size();
            long active = memberProjects.stream().filter(p -> "IN_PROGRESS".equalsIgnoreCase(p.getStatus())).count();
            long completed = memberProjects.stream().filter(p -> "COMPLETED".equalsIgnoreCase(p.getStatus())).count();
            long planning = memberProjects.stream().filter(p -> "PLANNING".equalsIgnoreCase(p.getStatus())).count();
            return new ProjectDto.ProjectStatsResponse(total, active, completed, planning);
        } else {
            long total = projectRepository.findByClient_User_UserIdAndIsDeletedFalse(userId).size();
            return new ProjectDto.ProjectStatsResponse(total, 0, 0, 0);
        }
    }

    private void verifyProjectAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRoleCode();
        Long userId = currentUser.getId();

        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            if (!project.getProjectManager().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have permission to access projects managed by another Project Manager");
            }
            return;
        }

        if ("CLIENT".equalsIgnoreCase(role)) {
            if (project.getClient().getUser() == null || !project.getClient().getUser().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have permission to access projects belonging to other clients");
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

    public ProjectDto.ProjectResponse mapToResponse(Project project) {
        long teamCount = projectMemberRepository.countByProject_ProjectIdAndStatus(project.getProjectId(), "ACTIVE");
        BigDecimal paid = project.getPaidAmount() != null ? project.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal remaining = project.getRemainingAmount();
        if (remaining == null && project.getBudget() != null) {
            remaining = project.getBudget().subtract(paid);
            if (remaining.compareTo(BigDecimal.ZERO) < 0) remaining = BigDecimal.ZERO;
        }

        return new ProjectDto.ProjectResponse(
                project.getProjectId(),
                project.getProjectCode(),
                project.getProjectName(),
                project.getDescription(),
                project.getClient().getClientId(),
                project.getClient().getCompanyName(),
                project.getClient().getContactPerson(),
                project.getClient().getEmail(),
                project.getProjectManager().getUserId(),
                project.getProjectManager().getFirstName() + " " + project.getProjectManager().getLastName(),
                project.getProjectManager().getEmail(),
                project.getStartDate(),
                project.getExpectedEndDate(),
                project.getActualEndDate(),
                project.getBudget(),
                paid,
                remaining,
                project.getPriority(),
                project.getStatus(),
                project.getProgress(),
                project.getTechnologyStack(),
                teamCount,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
