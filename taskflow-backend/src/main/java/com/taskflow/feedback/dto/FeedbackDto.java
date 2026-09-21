package com.taskflow.feedback.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public class FeedbackDto {

    public static class CreateFeedbackRequest {
        @NotNull(message = "Overall rating is required")
        @Min(value = 1, message = "Rating must be at least 1")
        @Max(value = 5, message = "Rating cannot exceed 5")
        private Integer rating;

        @Min(1) @Max(5)
        private Integer qualityRating;

        @Min(1) @Max(5)
        private Integer communicationRating;

        @Min(1) @Max(5)
        private Integer timelinessRating;

        @Min(1) @Max(5)
        private Integer valueRating;

        private String testimonial;
        private String comments;
        private String strengths;
        private String improvements;
        private Boolean wouldRecommend = true;

        public CreateFeedbackRequest() {}

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public Integer getQualityRating() { return qualityRating; }
        public void setQualityRating(Integer qualityRating) { this.qualityRating = qualityRating; }
        public Integer getCommunicationRating() { return communicationRating; }
        public void setCommunicationRating(Integer communicationRating) { this.communicationRating = communicationRating; }
        public Integer getTimelinessRating() { return timelinessRating; }
        public void setTimelinessRating(Integer timelinessRating) { this.timelinessRating = timelinessRating; }
        public Integer getValueRating() { return valueRating; }
        public void setValueRating(Integer valueRating) { this.valueRating = valueRating; }
        public String getTestimonial() { return testimonial; }
        public void setTestimonial(String testimonial) { this.testimonial = testimonial; }
        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
        public String getStrengths() { return strengths; }
        public void setStrengths(String strengths) { this.strengths = strengths; }
        public String getImprovements() { return improvements; }
        public void setImprovements(String improvements) { this.improvements = improvements; }
        public Boolean getWouldRecommend() { return wouldRecommend; }
        public void setWouldRecommend(Boolean wouldRecommend) { this.wouldRecommend = wouldRecommend; }
    }

    public static class FeedbackResponse {
        private Long feedbackId;
        private Long projectId;
        private String projectCode;
        private String projectName;
        private Long clientId;
        private String clientCompanyName;
        private String submittedByName;
        private Integer rating;
        private Integer qualityRating;
        private Integer communicationRating;
        private Integer timelinessRating;
        private Integer valueRating;
        private String testimonial;
        private String comments;
        private String strengths;
        private String improvements;
        private Boolean wouldRecommend;
        private Instant createdAt;
        private Instant updatedAt;

        public FeedbackResponse() {}

        public FeedbackResponse(Long feedbackId, Long projectId, String projectCode, String projectName,
                                Long clientId, String clientCompanyName, String submittedByName,
                                Integer rating, Integer qualityRating, Integer communicationRating,
                                Integer timelinessRating, Integer valueRating, String testimonial,
                                String comments, String strengths, String improvements,
                                Boolean wouldRecommend, Instant createdAt, Instant updatedAt) {
            this.feedbackId = feedbackId;
            this.projectId = projectId;
            this.projectCode = projectCode;
            this.projectName = projectName;
            this.clientId = clientId;
            this.clientCompanyName = clientCompanyName;
            this.submittedByName = submittedByName;
            this.rating = rating;
            this.qualityRating = qualityRating;
            this.communicationRating = communicationRating;
            this.timelinessRating = timelinessRating;
            this.valueRating = valueRating;
            this.testimonial = testimonial;
            this.comments = comments;
            this.strengths = strengths;
            this.improvements = improvements;
            this.wouldRecommend = wouldRecommend;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public Long getFeedbackId() { return feedbackId; }
        public void setFeedbackId(Long feedbackId) { this.feedbackId = feedbackId; }
        public Long getProjectId() { return projectId; }
        public void setProjectId(Long projectId) { this.projectId = projectId; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public Long getClientId() { return clientId; }
        public void setClientId(Long clientId) { this.clientId = clientId; }
        public String getClientCompanyName() { return clientCompanyName; }
        public void setClientCompanyName(String clientCompanyName) { this.clientCompanyName = clientCompanyName; }
        public String getSubmittedByName() { return submittedByName; }
        public void setSubmittedByName(String submittedByName) { this.submittedByName = submittedByName; }
        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }
        public Integer getQualityRating() { return qualityRating; }
        public void setQualityRating(Integer qualityRating) { this.qualityRating = qualityRating; }
        public Integer getCommunicationRating() { return communicationRating; }
        public void setCommunicationRating(Integer communicationRating) { this.communicationRating = communicationRating; }
        public Integer getTimelinessRating() { return timelinessRating; }
        public void setTimelinessRating(Integer timelinessRating) { this.timelinessRating = timelinessRating; }
        public Integer getValueRating() { return valueRating; }
        public void setValueRating(Integer valueRating) { this.valueRating = valueRating; }
        public String getTestimonial() { return testimonial; }
        public void setTestimonial(String testimonial) { this.testimonial = testimonial; }
        public String getComments() { return comments; }
        public void setComments(String comments) { this.comments = comments; }
        public String getStrengths() { return strengths; }
        public void setStrengths(String strengths) { this.strengths = strengths; }
        public String getImprovements() { return improvements; }
        public void setImprovements(String improvements) { this.improvements = improvements; }
        public Boolean getWouldRecommend() { return wouldRecommend; }
        public void setWouldRecommend(Boolean wouldRecommend) { this.wouldRecommend = wouldRecommend; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }
}
