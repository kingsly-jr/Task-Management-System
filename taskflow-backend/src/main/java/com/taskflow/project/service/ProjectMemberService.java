package com.taskflow.project.service;

import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
import com.taskflow.project.dto.ProjectMemberDto;
import com.taskflow.project.entity.Project;
import com.taskflow.project.entity.ProjectMember;
import com.taskflow.project.repository.ProjectMemberRepository;
import com.taskflow.project.repository.ProjectRepository;
import com.taskflow.role.entity.RoleCategory;
import com.taskflow.role.repository.RoleCategoryRepository;
import com.taskflow.security.UserPrincipal;
import com.taskflow.user.entity.User;
import com.taskflow.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ProjectMemberService {

    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final RoleCategoryRepository roleCategoryRepository;

    public ProjectMemberService(ProjectRepository projectRepository,
                                ProjectMemberRepository projectMemberRepository,
                                UserRepository userRepository,
                                RoleCategoryRepository roleCategoryRepository) {
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.roleCategoryRepository = roleCategoryRepository;
    }

    @Transactional
    public ProjectMemberDto.ProjectMemberResponse assignMember(UUID projectId, ProjectMemberDto.AssignMemberRequest request) {
        Project project = getProjectAndVerifyManageAccess(projectId);

        User user = userRepository.findById(request.getUserId())
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + request.getUserId()));

        if (!"TEAM_MEMBER".equalsIgnoreCase(user.getRole().getRoleCode())) {
            throw new BadRequestException("Only users with role TEAM_MEMBER can be assigned as project team members");
        }

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Cannot assign an inactive team member");
        }

        // Determine Role Category (either explicitly chosen or inherit user's primary category)
        RoleCategory roleCategory;
        if (request.getRoleCategoryId() != null) {
            roleCategory = roleCategoryRepository.findById(request.getRoleCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role category not found with id: " + request.getRoleCategoryId()));
        } else if (user.getRoleCategory() != null) {
            roleCategory = user.getRoleCategory();
        } else {
            throw new BadRequestException("Role category specialization must be specified for project assignment");
        }

        // Check if existing record exists
        Optional<ProjectMember> existingMemberOpt = projectMemberRepository
                .findByProject_ProjectIdAndUser_UserIdAndStatus(projectId, user.getUserId(), "ACTIVE");

        if (existingMemberOpt.isPresent()) {
            throw new BadRequestException("User " + user.getFirstName() + " " + user.getLastName() + " is already an active member of this project");
        }

        // Check if there is an inactive/removed record to reactivate
        Optional<ProjectMember> removedMemberOpt = projectMemberRepository
                .findByProject_ProjectIdAndUser_UserIdAndStatus(projectId, user.getUserId(), "REMOVED");

        ProjectMember memberToSave;
        if (removedMemberOpt.isPresent()) {
            memberToSave = removedMemberOpt.get();
            memberToSave.setStatus("ACTIVE");
            memberToSave.setRoleCategory(roleCategory);
            memberToSave.setAssignedAt(Instant.now());
            memberToSave.setRemovedAt(null);
        } else {
            memberToSave = ProjectMember.builder()
                    .project(project)
                    .user(user)
                    .roleCategory(roleCategory)
                    .assignedAt(Instant.now())
                    .status("ACTIVE")
                    .build();
        }

        ProjectMember saved = projectMemberRepository.save(memberToSave);
        return mapToMemberResponse(saved);
    }

    @Transactional
    public void removeMember(UUID projectId, UUID memberId) {
        getProjectAndVerifyManageAccess(projectId);

        ProjectMember member = projectMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("Project member not found with id: " + memberId));

        if (!member.getProject().getProjectId().equals(projectId)) {
            throw new BadRequestException("Project member does not belong to this project");
        }

        member.setStatus("REMOVED");
        member.setRemovedAt(Instant.now());
        projectMemberRepository.save(member);
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberDto.ProjectMemberResponse> getProjectMembers(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(project, currentUser);

        List<ProjectMember> members = projectMemberRepository.findByProject_ProjectIdAndStatusOrderByAssignedAtDesc(projectId, "ACTIVE");
        return members.stream().map(this::mapToMemberResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProjectMemberDto.AvailableMemberResponse> getAvailableMembers(UUID projectId) {
        getProjectAndVerifyManageAccess(projectId);

        List<User> activeTeamMembers = userRepository.findByRole_RoleCodeAndStatusAndIsDeletedFalse("TEAM_MEMBER", "ACTIVE");

        return activeTeamMembers.stream()
                .filter(u -> !projectMemberRepository.existsByProject_ProjectIdAndUser_UserIdAndStatus(projectId, u.getUserId(), "ACTIVE"))
                .map(u -> {
                    long activeCount = projectMemberRepository.countByUser_UserIdAndStatus(u.getUserId(), "ACTIVE");
                    Long catId = u.getRoleCategory() != null ? u.getRoleCategory().getRoleCategoryId() : null;
                    String catName = u.getRoleCategory() != null ? u.getRoleCategory().getRoleCategoryName() : "General";
                    return new ProjectMemberDto.AvailableMemberResponse(
                            u.getUserId(),
                            u.getFirstName() + " " + u.getLastName(),
                            u.getEmail(),
                            catId,
                            catName,
                            activeCount
                    );
                })
                .collect(Collectors.toList());
    }

    private Project getProjectAndVerifyManageAccess(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        if (!"ADMIN".equalsIgnoreCase(currentUser.getRoleCode()) &&
            !project.getProjectManager().getUserId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Only an Administrator or the assigned Project Manager can manage team members for this project");
        }
        return project;
    }

    private void verifyProjectViewAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRoleCode();
        UUID userId = currentUser.getId();

        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            if (!project.getProjectManager().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have permission to view team members of this project");
            }
            return;
        }

        if ("CLIENT".equalsIgnoreCase(role)) {
            if (project.getClient().getUser() == null || !project.getClient().getUser().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have permission to view team members of this project");
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

    private ProjectMemberDto.ProjectMemberResponse mapToMemberResponse(ProjectMember member) {
        return new ProjectMemberDto.ProjectMemberResponse(
                member.getProjectMemberId(),
                member.getUser().getUserId(),
                member.getUser().getFirstName() + " " + member.getUser().getLastName(),
                member.getUser().getEmail(),
                member.getRoleCategory() != null ? member.getRoleCategory().getRoleCategoryId() : null,
                member.getRoleCategory() != null ? member.getRoleCategory().getRoleCategoryName() : "General",
                member.getAssignedAt(),
                member.getStatus()
        );
    }
}
