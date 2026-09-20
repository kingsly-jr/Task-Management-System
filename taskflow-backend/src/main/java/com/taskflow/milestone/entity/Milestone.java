package com.taskflow.milestone.entity;

import com.taskflow.project.entity.Project;
import com.taskflow.task.entity.Task;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "milestones")
@EntityListeners(AuditingEntityListener.class)
public class Milestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "milestone_id", updatable = false, nullable = false)
    private Long milestoneId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_date", nullable = false)
    private LocalDate targetDate;

    @Column(name = "actual_completion_date")
    private LocalDate actualCompletionDate;

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED, DELAYED

    @Column(name = "order_index", nullable = false)
    private int orderIndex = 1;

    @OneToMany(mappedBy = "milestone", fetch = FetchType.LAZY)
    private List<Task> tasks = new ArrayList<>();

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public Milestone() {}

    public Milestone(Long milestoneId, Project project, String title, String description,
                     LocalDate targetDate, LocalDate actualCompletionDate, String status,
                     int orderIndex, List<Task> tasks, boolean isDeleted, Instant deletedAt,
                     Instant createdAt, Instant updatedAt) {
        this.milestoneId = milestoneId;
        this.project = project;
        this.title = title;
        this.description = description;
        this.targetDate = targetDate;
        this.actualCompletionDate = actualCompletionDate;
        this.status = status != null ? status : "PENDING";
        this.orderIndex = orderIndex;
        this.tasks = tasks != null ? tasks : new ArrayList<>();
        this.isDeleted = isDeleted;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static MilestoneBuilder builder() {
        return new MilestoneBuilder();
    }

    public static class MilestoneBuilder {
        private Long milestoneId;
        private Project project;
        private String title;
        private String description;
        private LocalDate targetDate;
        private LocalDate actualCompletionDate;
        private String status = "PENDING";
        private int orderIndex = 1;
        private List<Task> tasks = new ArrayList<>();
        private boolean isDeleted = false;
        private Instant deletedAt;
        private Instant createdAt;
        private Instant updatedAt;

        public MilestoneBuilder milestoneId(Long milestoneId) { this.milestoneId = milestoneId; return this; }
        public MilestoneBuilder project(Project project) { this.project = project; return this; }
        public MilestoneBuilder title(String title) { this.title = title; return this; }
        public MilestoneBuilder description(String description) { this.description = description; return this; }
        public MilestoneBuilder targetDate(LocalDate targetDate) { this.targetDate = targetDate; return this; }
        public MilestoneBuilder actualCompletionDate(LocalDate actualCompletionDate) { this.actualCompletionDate = actualCompletionDate; return this; }
        public MilestoneBuilder status(String status) { this.status = status; return this; }
        public MilestoneBuilder orderIndex(int orderIndex) { this.orderIndex = orderIndex; return this; }
        public MilestoneBuilder tasks(List<Task> tasks) { this.tasks = tasks; return this; }
        public MilestoneBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }
        public MilestoneBuilder deletedAt(Instant deletedAt) { this.deletedAt = deletedAt; return this; }
        public MilestoneBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public MilestoneBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public Milestone build() {
            return new Milestone(milestoneId, project, title, description, targetDate, actualCompletionDate,
                    status, orderIndex, tasks, isDeleted, deletedAt, createdAt, updatedAt);
        }
    }

    public Long getMilestoneId() { return milestoneId; }
    public void setMilestoneId(Long milestoneId) { this.milestoneId = milestoneId; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
    public LocalDate getActualCompletionDate() { return actualCompletionDate; }
    public void setActualCompletionDate(LocalDate actualCompletionDate) { this.actualCompletionDate = actualCompletionDate; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public int getOrderIndex() { return orderIndex; }
    public void setOrderIndex(int orderIndex) { this.orderIndex = orderIndex; }
    public List<Task> getTasks() { return tasks; }
    public void setTasks(List<Task> tasks) { this.tasks = tasks; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
