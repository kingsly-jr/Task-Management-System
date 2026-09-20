package com.taskflow.project.entity;

import com.taskflow.client.entity.Client;
import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "projects")
@EntityListeners(AuditingEntityListener.class)
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "project_id", updatable = false, nullable = false)
    private UUID projectId;

    @Column(name = "project_code", nullable = false, unique = true, length = 50)
    private String projectCode;

    @Column(name = "project_name", nullable = false, length = 150)
    private String projectName;

    @Column(name = "description", length = 2000)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_manager_id", nullable = false)
    private User projectManager;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "expected_end_date", nullable = false)
    private LocalDate expectedEndDate;

    @Column(name = "actual_end_date")
    private LocalDate actualEndDate;

    @Column(name = "budget", precision = 12, scale = 2)
    private BigDecimal budget;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority = "MEDIUM"; // LOW, MEDIUM, HIGH, URGENT

    @Column(name = "status", nullable = false, length = 30)
    private String status = "PLANNING"; // PLANNING, NOT_STARTED, IN_PROGRESS, ON_HOLD, COMPLETED, CANCELLED

    @Column(name = "progress", nullable = false)
    private Integer progress = 0; // 0 - 100

    @Column(name = "technology_stack", length = 500)
    private String technologyStack;

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

    public Project() {}

    public Project(UUID projectId, String projectCode, String projectName, String description,
                   Client client, User projectManager, LocalDate startDate, LocalDate expectedEndDate,
                   LocalDate actualEndDate, BigDecimal budget, String priority, String status,
                   Integer progress, String technologyStack, boolean isDeleted, Instant deletedAt,
                   Instant createdAt, Instant updatedAt) {
        this.projectId = projectId;
        this.projectCode = projectCode;
        this.projectName = projectName;
        this.description = description;
        this.client = client;
        this.projectManager = projectManager;
        this.startDate = startDate;
        this.expectedEndDate = expectedEndDate;
        this.actualEndDate = actualEndDate;
        this.budget = budget;
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = status != null ? status : "PLANNING";
        this.progress = progress != null ? progress : 0;
        this.technologyStack = technologyStack;
        this.isDeleted = isDeleted;
        this.deletedAt = deletedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ProjectBuilder builder() {
        return new ProjectBuilder();
    }

    public static class ProjectBuilder {
        private UUID projectId;
        private String projectCode;
        private String projectName;
        private String description;
        private Client client;
        private User projectManager;
        private LocalDate startDate;
        private LocalDate expectedEndDate;
        private LocalDate actualEndDate;
        private BigDecimal budget;
        private String priority = "MEDIUM";
        private String status = "PLANNING";
        private Integer progress = 0;
        private String technologyStack;
        private boolean isDeleted = false;
        private Instant deletedAt;
        private Instant createdAt;
        private Instant updatedAt;

        public ProjectBuilder projectId(UUID projectId) { this.projectId = projectId; return this; }
        public ProjectBuilder projectCode(String projectCode) { this.projectCode = projectCode; return this; }
        public ProjectBuilder projectName(String projectName) { this.projectName = projectName; return this; }
        public ProjectBuilder description(String description) { this.description = description; return this; }
        public ProjectBuilder client(Client client) { this.client = client; return this; }
        public ProjectBuilder projectManager(User projectManager) { this.projectManager = projectManager; return this; }
        public ProjectBuilder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public ProjectBuilder expectedEndDate(LocalDate expectedEndDate) { this.expectedEndDate = expectedEndDate; return this; }
        public ProjectBuilder actualEndDate(LocalDate actualEndDate) { this.actualEndDate = actualEndDate; return this; }
        public ProjectBuilder budget(BigDecimal budget) { this.budget = budget; return this; }
        public ProjectBuilder priority(String priority) { this.priority = priority; return this; }
        public ProjectBuilder status(String status) { this.status = status; return this; }
        public ProjectBuilder progress(Integer progress) { this.progress = progress; return this; }
        public ProjectBuilder technologyStack(String technologyStack) { this.technologyStack = technologyStack; return this; }
        public ProjectBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }
        public ProjectBuilder deletedAt(Instant deletedAt) { this.deletedAt = deletedAt; return this; }
        public ProjectBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public ProjectBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public Project build() {
            return new Project(projectId, projectCode, projectName, description, client, projectManager,
                    startDate, expectedEndDate, actualEndDate, budget, priority, status, progress,
                    technologyStack, isDeleted, deletedAt, createdAt, updatedAt);
        }
    }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }
    public String getProjectCode() { return projectCode; }
    public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
    public String getProjectName() { return projectName; }
    public void setProjectName(String projectName) { this.projectName = projectName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Client getClient() { return client; }
    public void setClient(Client client) { this.client = client; }
    public User getProjectManager() { return projectManager; }
    public void setProjectManager(User projectManager) { this.projectManager = projectManager; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public LocalDate getExpectedEndDate() { return expectedEndDate; }
    public void setExpectedEndDate(LocalDate expectedEndDate) { this.expectedEndDate = expectedEndDate; }
    public LocalDate getActualEndDate() { return actualEndDate; }
    public void setActualEndDate(LocalDate actualEndDate) { this.actualEndDate = actualEndDate; }
    public BigDecimal getBudget() { return budget; }
    public void setBudget(BigDecimal budget) { this.budget = budget; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getProgress() { return progress; }
    public void setProgress(Integer progress) { this.progress = progress; }
    public String getTechnologyStack() { return technologyStack; }
    public void setTechnologyStack(String technologyStack) { this.technologyStack = technologyStack; }
    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
