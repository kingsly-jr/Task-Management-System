package com.taskflow.bug.service;

import com.taskflow.bug.dto.BugDto;
import com.taskflow.bug.entity.Bug;
import com.taskflow.bug.entity.BugComment;
import com.taskflow.bug.repository.BugCommentRepository;
import com.taskflow.bug.repository.BugRepository;
import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
import com.taskflow.project.entity.Project;
import com.taskflow.project.repository.ProjectMemberRepository;
import com.taskflow.project.repository.ProjectRepository;
import com.taskflow.security.UserPrincipal;
import com.taskflow.task.entity.Task;
import com.taskflow.task.repository.TaskRepository;
import com.taskflow.user.entity.User;
import com.taskflow.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BugService {

    private final BugRepository bugRepository;
    private final BugCommentRepository bugCommentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public BugService(BugRepository bugRepository,
                      BugCommentRepository bugCommentRepository,
                      ProjectRepository projectRepository,
                      ProjectMemberRepository projectMemberRepository,
                      TaskRepository taskRepository,
                      UserRepository userRepository) {
        this.bugRepository = bugRepository;
        this.bugCommentRepository = bugCommentRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public BugDto.BugResponse createBug(UUID projectId, BugDto.CreateBugRequest request) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectAccess(project, currentUser);

        User reporter = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Task linkedTask = null;
        if (request.getTaskId() != null) {
            linkedTask = taskRepository.findById(request.getTaskId())
                    .filter(t -> !t.isDeleted())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + request.getTaskId()));
            if (!linkedTask.getProject().getProjectId().equals(projectId)) {
                throw new BadRequestException("Specified task does not belong to this project");
            }
        }

        User assignee = null;
        String initialStatus = "OPEN";
        if (request.getAssignedToId() != null) {
            boolean isMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserIdAndStatus(projectId, request.getAssignedToId(), "ACTIVE");
            if (!isMember) {
                throw new BadRequestException("Assigned user is not an active team member of this project");
            }
            assignee = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assignee not found: " + request.getAssignedToId()));
            initialStatus = "ASSIGNED";
        }

        // Auto-generate bug code: PRJ-0001-B01
        long count = bugRepository.countByProject_ProjectIdAndIsDeletedFalse(projectId);
        String bugCode = String.format("%s-B%02d", project.getProjectCode(), count + 1);
        while (bugRepository.existsByBugCodeIgnoreCaseAndIsDeletedFalse(bugCode)) {
            count++;
            bugCode = String.format("%s-B%02d", project.getProjectCode(), count + 1);
        }

        Bug bug = Bug.builder()
                .project(project)
                .task(linkedTask)
                .bugCode(bugCode)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .stepsToReproduce(request.getStepsToReproduce())
                .expectedBehavior(request.getExpectedBehavior())
                .actualBehavior(request.getActualBehavior())
                .severity(request.getSeverity() != null ? request.getSeverity().toUpperCase() : "MEDIUM")
                .priority(request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM")
                .status(initialStatus)
                .environment(request.getEnvironment())
                .reportedBy(reporter)
                .assignedTo(assignee)
                .isDeleted(false)
                .build();

        Bug saved = bugRepository.save(bug);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BugDto.BugResponse> getBugsForProject(UUID projectId, String status, String severity, UUID assignedToId, String search) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectAccess(project, currentUser);

        List<Bug> bugs = bugRepository.findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(projectId);

        return bugs.stream()
                .filter(b -> {
                    boolean matchStatus = status == null || status.isBlank() || "ALL".equalsIgnoreCase(status) ||
                            b.getStatus().equalsIgnoreCase(status);
                    boolean matchSeverity = severity == null || severity.isBlank() || "ALL".equalsIgnoreCase(severity) ||
                            b.getSeverity().equalsIgnoreCase(severity);
                    boolean matchAssignee = assignedToId == null ||
                            (b.getAssignedTo() != null && b.getAssignedTo().getUserId().equals(assignedToId));
                    boolean matchSearch = search == null || search.isBlank() ||
                            b.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                            b.getBugCode().toLowerCase().contains(search.toLowerCase());
                    return matchStatus && matchSeverity && matchAssignee && matchSearch;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BugDto.BugResponse> getMyBugs(String filterType) {
        UserPrincipal currentUser = getCurrentUserPrincipal();
        UUID userId = currentUser.getId();

        List<Bug> bugs;
        if ("REPORTED".equalsIgnoreCase(filterType)) {
            bugs = bugRepository.findByReportedBy_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
        } else {
            // Default ASSIGNED
            bugs = bugRepository.findByAssignedTo_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId);
        }

        return bugs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BugDto.BugDetailResponse getBugById(UUID bugId) {
        Bug bug = bugRepository.findById(bugId)
                .filter(b -> !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found with id: " + bugId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectAccess(bug.getProject(), currentUser);

        BugDto.BugResponse base = mapToResponse(bug);
        BugDto.BugDetailResponse detail = new BugDto.BugDetailResponse();
        copyProperties(base, detail);

        List<BugComment> comments = bugCommentRepository.findByBug_BugIdOrderByCreatedAtAsc(bugId);
        detail.setComments(comments.stream().map(c -> new BugDto.BugCommentResponse(
                c.getCommentId(),
                c.getUser().getUserId(),
                c.getUser().getFirstName() + " " + c.getUser().getLastName(),
                c.getContent(),
                c.getCreatedAt()
        )).collect(Collectors.toList()));

        return detail;
    }

    @Transactional
    public BugDto.BugResponse assignBug(UUID bugId, BugDto.AssignBugRequest request) {
        Bug bug = bugRepository.findById(bugId)
                .filter(b -> !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found with id: " + bugId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        if (!hasManageAccess(bug.getProject(), currentUser)) {
            throw new AccessDeniedException("Only the Project Manager or Admin can reassign bugs");
        }

        boolean isMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserIdAndStatus(
                bug.getProject().getProjectId(), request.getAssignedToId(), "ACTIVE");
        if (!isMember) {
            throw new BadRequestException("Assigned user is not an active team member of this project");
        }

        User assignee = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignee not found"));

        bug.setAssignedTo(assignee);
        if ("OPEN".equalsIgnoreCase(bug.getStatus())) {
            bug.setStatus("ASSIGNED");
        }

        Bug updated = bugRepository.save(bug);
        return mapToResponse(updated);
    }

    @Transactional
    public BugDto.BugResponse updateBugStatus(UUID bugId, BugDto.UpdateBugStatusRequest request) {
        Bug bug = bugRepository.findById(bugId)
                .filter(b -> !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found with id: " + bugId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectAccess(bug.getProject(), currentUser);

        String newStatus = request.getStatus().toUpperCase().trim();
        bug.setStatus(newStatus);
        Bug updated = bugRepository.save(bug);
        return mapToResponse(updated);
    }

    @Transactional
    public BugDto.BugResponse resolveBug(UUID bugId, BugDto.ResolveBugRequest request) {
        Bug bug = bugRepository.findById(bugId)
                .filter(b -> !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found with id: " + bugId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectAccess(bug.getProject(), currentUser);

        bug.setStatus("RESOLVED");
        bug.setResolutionNotes(request.getResolutionNotes().trim());

        Bug updated = bugRepository.save(bug);
        return mapToResponse(updated);
    }

    @Transactional
    public BugDto.BugResponse retestBug(UUID bugId, BugDto.RetestBugRequest request) {
        Bug bug = bugRepository.findById(bugId)
                .filter(b -> !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found with id: " + bugId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectAccess(bug.getProject(), currentUser);

        if (request.isPassed()) {
            bug.setStatus("CLOSED");
        } else {
            bug.setStatus("REOPENED");
        }
        bug.setRetestNotes(request.getRetestNotes() != null ? request.getRetestNotes().trim() : "");

        Bug updated = bugRepository.save(bug);
        return mapToResponse(updated);
    }

    @Transactional
    public BugDto.BugCommentResponse addComment(UUID bugId, BugDto.CreateBugCommentRequest request) {
        Bug bug = bugRepository.findById(bugId)
                .filter(b -> !b.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Bug not found with id: " + bugId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectAccess(bug.getProject(), currentUser);

        User author = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        BugComment comment = BugComment.builder()
                .bug(bug)
                .user(author)
                .content(request.getContent().trim())
                .build();

        BugComment saved = bugCommentRepository.save(comment);
        return new BugDto.BugCommentResponse(
                saved.getCommentId(),
                author.getUserId(),
                author.getFirstName() + " " + author.getLastName(),
                saved.getContent(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public BugDto.BugStatsResponse getBugStats(UUID projectId) {
        long total = bugRepository.countByProject_ProjectIdAndIsDeletedFalse(projectId);
        long open = bugRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "OPEN");
        long assigned = bugRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "ASSIGNED");
        long inProgress = bugRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "IN_PROGRESS");
        long resolved = bugRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "RESOLVED");
        long underRetest = bugRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "UNDER_RETEST");
        long closed = bugRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "CLOSED");
        long reopened = bugRepository.countByProject_ProjectIdAndStatusAndIsDeletedFalse(projectId, "REOPENED");
        long critical = bugRepository.countByProject_ProjectIdAndSeverityAndIsDeletedFalse(projectId, "CRITICAL");

        return new BugDto.BugStatsResponse(total, open, assigned, inProgress, resolved, underRetest, closed, reopened, critical);
    }

    private void verifyProjectAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRoleCode();
        UUID userId = currentUser.getId();

        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            if (!project.getProjectManager().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not manage this project");
            }
            return;
        }

        if ("CLIENT".equalsIgnoreCase(role)) {
            if (project.getClient().getUser() == null || !project.getClient().getUser().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have access to bugs for this project");
            }
            return;
        }

        boolean isMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserIdAndStatus(
                project.getProjectId(), userId, "ACTIVE");
        if (!isMember) {
            throw new AccessDeniedException("You are not an active member of this project team");
        }
    }

    private boolean hasManageAccess(Project project, UserPrincipal currentUser) {
        if ("ADMIN".equalsIgnoreCase(currentUser.getRoleCode())) return true;
        return "PROJECT_MANAGER".equalsIgnoreCase(currentUser.getRoleCode()) &&
                project.getProjectManager().getUserId().equals(currentUser.getId());
    }

    private UserPrincipal getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User not authenticated");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    private BugDto.BugResponse mapToResponse(Bug bug) {
        long commentsCount = bugCommentRepository.countByBug_BugId(bug.getBugId());

        return new BugDto.BugResponse(
                bug.getBugId(),
                bug.getProject().getProjectId(),
                bug.getProject().getProjectCode(),
                bug.getProject().getProjectName(),
                bug.getTask() != null ? bug.getTask().getTaskId() : null,
                bug.getTask() != null ? bug.getTask().getTaskCode() : null,
                bug.getTask() != null ? bug.getTask().getTitle() : null,
                bug.getBugCode(),
                bug.getTitle(),
                bug.getDescription(),
                bug.getStepsToReproduce(),
                bug.getExpectedBehavior(),
                bug.getActualBehavior(),
                bug.getSeverity(),
                bug.getPriority(),
                bug.getStatus(),
                bug.getEnvironment(),
                bug.getReportedBy().getUserId(),
                bug.getReportedBy().getFirstName() + " " + bug.getReportedBy().getLastName(),
                bug.getReportedBy().getEmail(),
                bug.getAssignedTo() != null ? bug.getAssignedTo().getUserId() : null,
                bug.getAssignedTo() != null ? (bug.getAssignedTo().getFirstName() + " " + bug.getAssignedTo().getLastName()) : null,
                bug.getAssignedTo() != null ? bug.getAssignedTo().getEmail() : null,
                bug.getResolutionNotes(),
                bug.getRetestNotes(),
                commentsCount,
                bug.getCreatedAt(),
                bug.getUpdatedAt()
        );
    }

    private void copyProperties(BugDto.BugResponse src, BugDto.BugDetailResponse dest) {
        dest.setBugId(src.getBugId());
        dest.setProjectId(src.getProjectId());
        dest.setProjectCode(src.getProjectCode());
        dest.setProjectName(src.getProjectName());
        dest.setTaskId(src.getTaskId());
        dest.setTaskCode(src.getTaskCode());
        dest.setTaskTitle(src.getTaskTitle());
        dest.setBugCode(src.getBugCode());
        dest.setTitle(src.getTitle());
        dest.setDescription(src.getDescription());
        dest.setStepsToReproduce(src.getStepsToReproduce());
        dest.setExpectedBehavior(src.getExpectedBehavior());
        dest.setActualBehavior(src.getActualBehavior());
        dest.setSeverity(src.getSeverity());
        dest.setPriority(src.getPriority());
        dest.setStatus(src.getStatus());
        dest.setEnvironment(src.getEnvironment());
        dest.setReportedById(src.getReportedById());
        dest.setReportedByName(src.getReportedByName());
        dest.setReportedByEmail(src.getReportedByEmail());
        dest.setAssignedToId(src.getAssignedToId());
        dest.setAssignedToName(src.getAssignedToName());
        dest.setAssignedToEmail(src.getAssignedToEmail());
        dest.setResolutionNotes(src.getResolutionNotes());
        dest.setRetestNotes(src.getRetestNotes());
        dest.setCommentsCount(src.getCommentsCount());
        dest.setCreatedAt(src.getCreatedAt());
        dest.setUpdatedAt(src.getUpdatedAt());
    }
}
