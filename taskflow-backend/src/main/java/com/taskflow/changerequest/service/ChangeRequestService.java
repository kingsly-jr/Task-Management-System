package com.taskflow.changerequest.service;

import com.taskflow.changerequest.dto.ChangeRequestDto;
import com.taskflow.changerequest.entity.ChangeRequest;
import com.taskflow.changerequest.entity.ChangeRequestComment;
import com.taskflow.changerequest.repository.ChangeRequestCommentRepository;
import com.taskflow.changerequest.repository.ChangeRequestRepository;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
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
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ChangeRequestService {

    private final ChangeRequestRepository changeRequestRepository;
    private final ChangeRequestCommentRepository commentRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;

    public ChangeRequestService(ChangeRequestRepository changeRequestRepository,
                                ChangeRequestCommentRepository commentRepository,
                                ProjectRepository projectRepository,
                                ProjectMemberRepository projectMemberRepository,
                                UserRepository userRepository) {
        this.changeRequestRepository = changeRequestRepository;
        this.commentRepository = commentRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ChangeRequestDto.ChangeRequestResponse createChangeRequest(UUID projectId, ChangeRequestDto.CreateChangeRequest request) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(project, currentUser);

        User requester = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Auto-generate code e.g. PRJ-0001-CR01
        long count = changeRequestRepository.countByProject_ProjectIdAndIsDeletedFalse(projectId);
        String crCode = String.format("%s-CR%02d", project.getProjectCode(), count + 1);
        while (changeRequestRepository.existsByChangeRequestCodeIgnoreCaseAndIsDeletedFalse(crCode)) {
            count++;
            crCode = String.format("%s-CR%02d", project.getProjectCode(), count + 1);
        }

        ChangeRequest cr = ChangeRequest.builder()
                .project(project)
                .changeRequestCode(crCode)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .reasonForChange(request.getReasonForChange())
                .estimatedCost(request.getEstimatedCost() != null ? request.getEstimatedCost() : BigDecimal.ZERO)
                .scheduleImpactDays(request.getScheduleImpactDays() != null ? request.getScheduleImpactDays() : 0)
                .priority(request.getPriority() != null ? request.getPriority().toUpperCase() : "MEDIUM")
                .status("SUBMITTED")
                .requestedBy(requester)
                .isDeleted(false)
                .build();

        ChangeRequest saved = changeRequestRepository.save(cr);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ChangeRequestDto.ChangeRequestResponse> getChangeRequestsForProject(UUID projectId, String status, String search) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(project, currentUser);

        List<ChangeRequest> list = changeRequestRepository.findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(projectId);

        return list.stream()
                .filter(cr -> {
                    boolean matchStatus = status == null || status.isBlank() || "ALL".equalsIgnoreCase(status) ||
                            cr.getStatus().equalsIgnoreCase(status);
                    boolean matchSearch = search == null || search.isBlank() ||
                            cr.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                            cr.getChangeRequestCode().toLowerCase().contains(search.toLowerCase());
                    return matchStatus && matchSearch;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ChangeRequestDto.ChangeRequestDetailResponse getChangeRequestById(UUID id) {
        ChangeRequest cr = changeRequestRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Change request not found with id: " + id));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(cr.getProject(), currentUser);

        ChangeRequestDto.ChangeRequestResponse base = mapToResponse(cr);
        ChangeRequestDto.ChangeRequestDetailResponse detail = new ChangeRequestDto.ChangeRequestDetailResponse();
        copyProperties(base, detail);

        List<ChangeRequestComment> comments = commentRepository.findByChangeRequest_ChangeRequestIdOrderByCreatedAtAsc(id);
        detail.setComments(comments.stream().map(c -> new ChangeRequestDto.CommentResponse(
                c.getCommentId(),
                c.getUser().getUserId(),
                c.getUser().getFirstName() + " " + c.getUser().getLastName(),
                c.getContent(),
                c.getCreatedAt()
        )).collect(Collectors.toList()));

        return detail;
    }

    @Transactional
    public ChangeRequestDto.ChangeRequestResponse reviewChangeRequest(UUID id, ChangeRequestDto.ReviewChangeRequest request) {
        ChangeRequest cr = changeRequestRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Change request not found with id: " + id));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        if (!hasManageAccess(cr.getProject(), currentUser)) {
            throw new AccessDeniedException("Only the Project Manager or Admin can review and approve/reject change requests");
        }

        User reviewer = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Reviewer user not found"));

        cr.setStatus(request.isApproved() ? "APPROVED" : "REJECTED");
        cr.setReviewedBy(reviewer);
        cr.setReviewNotes(request.getReviewNotes().trim());
        cr.setReviewedAt(Instant.now());

        ChangeRequest updated = changeRequestRepository.save(cr);
        return mapToResponse(updated);
    }

    @Transactional
    public ChangeRequestDto.ChangeRequestResponse updateStatus(UUID id, ChangeRequestDto.UpdateStatusRequest request) {
        ChangeRequest cr = changeRequestRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Change request not found with id: " + id));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        if (!hasManageAccess(cr.getProject(), currentUser)) {
            throw new AccessDeniedException("Only the Project Manager or Admin can update change request status");
        }

        cr.setStatus(request.getStatus().toUpperCase().trim());
        ChangeRequest updated = changeRequestRepository.save(cr);
        return mapToResponse(updated);
    }

    @Transactional
    public ChangeRequestDto.CommentResponse addComment(UUID id, ChangeRequestDto.CreateCommentRequest request) {
        ChangeRequest cr = changeRequestRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Change request not found with id: " + id));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(cr.getProject(), currentUser);

        User author = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        ChangeRequestComment comment = ChangeRequestComment.builder()
                .changeRequest(cr)
                .user(author)
                .content(request.getContent().trim())
                .build();

        ChangeRequestComment saved = commentRepository.save(comment);
        return new ChangeRequestDto.CommentResponse(
                saved.getCommentId(),
                author.getUserId(),
                author.getFirstName() + " " + author.getLastName(),
                saved.getContent(),
                saved.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public ChangeRequestDto.ChangeRequestStatsResponse getStats(UUID projectId) {
        List<ChangeRequest> list = changeRequestRepository.findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(projectId);

        long total = list.size();
        long submitted = list.stream().filter(c -> "SUBMITTED".equalsIgnoreCase(c.getStatus())).count();
        long underReview = list.stream().filter(c -> "UNDER_REVIEW".equalsIgnoreCase(c.getStatus())).count();
        long approved = list.stream().filter(c -> "APPROVED".equalsIgnoreCase(c.getStatus())).count();
        long rejected = list.stream().filter(c -> "REJECTED".equalsIgnoreCase(c.getStatus())).count();
        long implemented = list.stream().filter(c -> "IMPLEMENTED".equalsIgnoreCase(c.getStatus())).count();

        BigDecimal approvedCost = list.stream()
                .filter(c -> "APPROVED".equalsIgnoreCase(c.getStatus()) || "IMPLEMENTED".equalsIgnoreCase(c.getStatus()))
                .map(ChangeRequest::getEstimatedCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int scheduleDays = list.stream()
                .filter(c -> "APPROVED".equalsIgnoreCase(c.getStatus()) || "IMPLEMENTED".equalsIgnoreCase(c.getStatus()))
                .mapToInt(c -> c.getScheduleImpactDays() != null ? c.getScheduleImpactDays() : 0)
                .sum();

        return new ChangeRequestDto.ChangeRequestStatsResponse(
                total, submitted, underReview, approved, rejected, implemented, approvedCost, scheduleDays
        );
    }

    private void verifyProjectViewAccess(Project project, UserPrincipal currentUser) {
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
                throw new AccessDeniedException("You do not have access to change requests for this project");
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

    private ChangeRequestDto.ChangeRequestResponse mapToResponse(ChangeRequest cr) {
        long commentsCount = commentRepository.countByChangeRequest_ChangeRequestId(cr.getChangeRequestId());

        return new ChangeRequestDto.ChangeRequestResponse(
                cr.getChangeRequestId(),
                cr.getProject().getProjectId(),
                cr.getProject().getProjectCode(),
                cr.getProject().getProjectName(),
                cr.getChangeRequestCode(),
                cr.getTitle(),
                cr.getDescription(),
                cr.getReasonForChange(),
                cr.getEstimatedCost(),
                cr.getScheduleImpactDays(),
                cr.getPriority(),
                cr.getStatus(),
                cr.getRequestedBy().getUserId(),
                cr.getRequestedBy().getFirstName() + " " + cr.getRequestedBy().getLastName(),
                cr.getRequestedBy().getEmail(),
                cr.getReviewedBy() != null ? cr.getReviewedBy().getUserId() : null,
                cr.getReviewedBy() != null ? (cr.getReviewedBy().getFirstName() + " " + cr.getReviewedBy().getLastName()) : null,
                cr.getReviewedBy() != null ? cr.getReviewedBy().getEmail() : null,
                cr.getReviewNotes(),
                cr.getReviewedAt(),
                commentsCount,
                cr.getCreatedAt(),
                cr.getUpdatedAt()
        );
    }

    private void copyProperties(ChangeRequestDto.ChangeRequestResponse src, ChangeRequestDto.ChangeRequestDetailResponse dest) {
        dest.setChangeRequestId(src.getChangeRequestId());
        dest.setProjectId(src.getProjectId());
        dest.setProjectCode(src.getProjectCode());
        dest.setProjectName(src.getProjectName());
        dest.setChangeRequestCode(src.getChangeRequestCode());
        dest.setTitle(src.getTitle());
        dest.setDescription(src.getDescription());
        dest.setReasonForChange(src.getReasonForChange());
        dest.setEstimatedCost(src.getEstimatedCost());
        dest.setScheduleImpactDays(src.getScheduleImpactDays());
        dest.setPriority(src.getPriority());
        dest.setStatus(src.getStatus());
        dest.setRequestedById(src.getRequestedById());
        dest.setRequestedByName(src.getRequestedByName());
        dest.setRequestedByEmail(src.getRequestedByEmail());
        dest.setReviewedById(src.getReviewedById());
        dest.setReviewedByName(src.getReviewedByName());
        dest.setReviewedByEmail(src.getReviewedByEmail());
        dest.setReviewNotes(src.getReviewNotes());
        dest.setReviewedAt(src.getReviewedAt());
        dest.setCommentsCount(src.getCommentsCount());
        dest.setCreatedAt(src.getCreatedAt());
        dest.setUpdatedAt(src.getUpdatedAt());
    }
}
