package com.taskflow.feedback.service;

import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.feedback.dto.FeedbackDto;
import com.taskflow.feedback.entity.ProjectFeedback;
import com.taskflow.feedback.repository.ProjectFeedbackRepository;
import com.taskflow.project.entity.Project;
import com.taskflow.project.repository.ProjectRepository;
import com.taskflow.user.entity.User;
import com.taskflow.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProjectFeedbackService {

    private final ProjectFeedbackRepository feedbackRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    public ProjectFeedbackService(ProjectFeedbackRepository feedbackRepository,
                                  ProjectRepository projectRepository,
                                  UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.projectRepository = projectRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public FeedbackDto.FeedbackResponse submitProjectFeedback(Long projectId, FeedbackDto.CreateFeedbackRequest request, Long userId) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        // Enforce tenant boundary: must be the client associated with this project
        if (project.getClient() == null || project.getClient().getUser() == null ||
                !project.getClient().getUser().getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to submit feedback for this project");
        }

        // Enforce completion rule: project must be COMPLETED
        if (!"COMPLETED".equalsIgnoreCase(project.getStatus())) {
            throw new BadRequestException("Feedback can only be submitted once the project reaches COMPLETED status. Current status: " + project.getStatus());
        }

        // Check if feedback already exists for this project; if so, update it
        ProjectFeedback feedback = feedbackRepository.findByProject_ProjectId(projectId)
                .orElse(null);

        if (feedback == null) {
            feedback = ProjectFeedback.builder()
                    .project(project)
                    .client(project.getClient())
                    .submittedBy(user)
                    .rating(request.getRating())
                    .qualityRating(request.getQualityRating() != null ? request.getQualityRating() : request.getRating())
                    .communicationRating(request.getCommunicationRating() != null ? request.getCommunicationRating() : request.getRating())
                    .timelinessRating(request.getTimelinessRating() != null ? request.getTimelinessRating() : request.getRating())
                    .valueRating(request.getValueRating() != null ? request.getValueRating() : request.getRating())
                    .testimonial(request.getTestimonial())
                    .comments(request.getComments())
                    .strengths(request.getStrengths())
                    .improvements(request.getImprovements())
                    .wouldRecommend(request.getWouldRecommend() != null ? request.getWouldRecommend() : true)
                    .build();
        } else {
            feedback.setRating(request.getRating());
            if (request.getQualityRating() != null) feedback.setQualityRating(request.getQualityRating());
            if (request.getCommunicationRating() != null) feedback.setCommunicationRating(request.getCommunicationRating());
            if (request.getTimelinessRating() != null) feedback.setTimelinessRating(request.getTimelinessRating());
            if (request.getValueRating() != null) feedback.setValueRating(request.getValueRating());
            feedback.setTestimonial(request.getTestimonial());
            feedback.setComments(request.getComments());
            feedback.setStrengths(request.getStrengths());
            feedback.setImprovements(request.getImprovements());
            if (request.getWouldRecommend() != null) feedback.setWouldRecommend(request.getWouldRecommend());
        }

        ProjectFeedback saved = feedbackRepository.save(feedback);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public FeedbackDto.FeedbackResponse getFeedbackByProject(Long projectId, Long userId, String role) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        if ("CLIENT".equalsIgnoreCase(role)) {
            if (project.getClient() == null || project.getClient().getUser() == null ||
                    !project.getClient().getUser().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have permission to view feedback for this project");
            }
        }

        ProjectFeedback feedback = feedbackRepository.findByProject_ProjectId(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("No feedback submitted yet for project: " + project.getProjectName()));

        return mapToResponse(feedback);
    }

    @Transactional(readOnly = true)
    public List<FeedbackDto.FeedbackResponse> getMyFeedbacks(Long userId) {
        return feedbackRepository.findByProject_Client_User_UserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public FeedbackDto.FeedbackResponse mapToResponse(ProjectFeedback f) {
        return new FeedbackDto.FeedbackResponse(
                f.getFeedbackId(),
                f.getProject().getProjectId(),
                f.getProject().getProjectCode(),
                f.getProject().getProjectName(),
                f.getClient().getClientId(),
                f.getClient().getCompanyName(),
                f.getSubmittedBy().getFirstName() + " " + (f.getSubmittedBy().getLastName() != null ? f.getSubmittedBy().getLastName() : ""),
                f.getRating(),
                f.getQualityRating(),
                f.getCommunicationRating(),
                f.getTimelinessRating(),
                f.getValueRating(),
                f.getTestimonial(),
                f.getComments(),
                f.getStrengths(),
                f.getImprovements(),
                f.getWouldRecommend(),
                f.getCreatedAt(),
                f.getUpdatedAt()
        );
    }
}
