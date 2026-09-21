package com.taskflow.feedback.entity;

import com.taskflow.client.entity.Client;
import com.taskflow.project.entity.Project;
import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "project_feedback")
@EntityListeners(AuditingEntityListener.class)
public class ProjectFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id", updatable = false, nullable = false)
    private Long feedbackId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    private User submittedBy;

    @Column(name = "rating", nullable = false)
    private Integer rating; // 1 - 5 stars

    @Column(name = "quality_rating")
    private Integer qualityRating; // 1 - 5

    @Column(name = "communication_rating")
    private Integer communicationRating; // 1 - 5

    @Column(name = "timeliness_rating")
    private Integer timelinessRating; // 1 - 5

    @Column(name = "value_rating")
    private Integer valueRating; // 1 - 5

    @Column(name = "testimonial", columnDefinition = "TEXT")
    private String testimonial;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "strengths", columnDefinition = "TEXT")
    private String strengths;

    @Column(name = "improvements", columnDefinition = "TEXT")
    private String improvements;

    @Column(name = "would_recommend")
    private Boolean wouldRecommend = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public ProjectFeedback() {}

    public ProjectFeedback(Long feedbackId, Project project, Client client, User submittedBy,
                           Integer rating, Integer qualityRating, Integer communicationRating,
                           Integer timelinessRating, Integer valueRating, String testimonial,
                           String comments, String strengths, String improvements,
                           Boolean wouldRecommend, Instant createdAt, Instant updatedAt) {
        this.feedbackId = feedbackId;
        this.project = project;
        this.client = client;
        this.submittedBy = submittedBy;
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

    public static ProjectFeedbackBuilder builder() {
        return new ProjectFeedbackBuilder();
    }

    public static class ProjectFeedbackBuilder {
        private Long feedbackId;
        private Project project;
        private Client client;
        private User submittedBy;
        private Integer rating;
        private Integer qualityRating;
        private Integer communicationRating;
        private Integer timelinessRating;
        private Integer valueRating;
        private String testimonial;
        private String comments;
        private String strengths;
        private String improvements;
        private Boolean wouldRecommend = true;
        private Instant createdAt;
        private Instant updatedAt;

        public ProjectFeedbackBuilder feedbackId(Long feedbackId) { this.feedbackId = feedbackId; return this; }
        public ProjectFeedbackBuilder project(Project project) { this.project = project; return this; }
        public ProjectFeedbackBuilder client(Client client) { this.client = client; return this; }
        public ProjectFeedbackBuilder submittedBy(User submittedBy) { this.submittedBy = submittedBy; return this; }
        public ProjectFeedbackBuilder rating(Integer rating) { this.rating = rating; return this; }
        public ProjectFeedbackBuilder qualityRating(Integer qualityRating) { this.qualityRating = qualityRating; return this; }
        public ProjectFeedbackBuilder communicationRating(Integer communicationRating) { this.communicationRating = communicationRating; return this; }
        public ProjectFeedbackBuilder timelinessRating(Integer timelinessRating) { this.timelinessRating = timelinessRating; return this; }
        public ProjectFeedbackBuilder valueRating(Integer valueRating) { this.valueRating = valueRating; return this; }
        public ProjectFeedbackBuilder testimonial(String testimonial) { this.testimonial = testimonial; return this; }
        public ProjectFeedbackBuilder comments(String comments) { this.comments = comments; return this; }
        public ProjectFeedbackBuilder strengths(String strengths) { this.strengths = strengths; return this; }
        public ProjectFeedbackBuilder improvements(String improvements) { this.improvements = improvements; return this; }
        public ProjectFeedbackBuilder wouldRecommend(Boolean wouldRecommend) { this.wouldRecommend = wouldRecommend; return this; }
        public ProjectFeedbackBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public ProjectFeedbackBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public ProjectFeedback build() {
            return new ProjectFeedback(feedbackId, project, client, submittedBy, rating, qualityRating,
                    communicationRating, timelinessRating, valueRating, testimonial, comments, strengths,
                    improvements, wouldRecommend, createdAt, updatedAt);
        }
    }

    // Getters and Setters
    public Long getFeedbackId() { return feedbackId; }
    public void setFeedbackId(Long feedbackId) { this.feedbackId = feedbackId; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public User getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(User submittedBy) { this.submittedBy = submittedBy; }
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
