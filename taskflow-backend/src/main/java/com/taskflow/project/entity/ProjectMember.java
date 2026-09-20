package com.taskflow.project.entity;

import com.taskflow.role.entity.RoleCategory;
import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_members")
@EntityListeners(AuditingEntityListener.class)
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "project_member_id", updatable = false, nullable = false)
    private UUID projectMemberId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_category_id", nullable = false)
    private RoleCategory roleCategory;

    @CreatedDate
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt;

    @Column(name = "removed_at")
    private Instant removedAt;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, REMOVED

    public ProjectMember() {}

    public ProjectMember(UUID projectMemberId, Project project, User user, RoleCategory roleCategory,
                         Instant assignedAt, Instant removedAt, String status) {
        this.projectMemberId = projectMemberId;
        this.project = project;
        this.user = user;
        this.roleCategory = roleCategory;
        this.assignedAt = assignedAt;
        this.removedAt = removedAt;
        this.status = status != null ? status : "ACTIVE";
    }

    public static ProjectMemberBuilder builder() {
        return new ProjectMemberBuilder();
    }

    public static class ProjectMemberBuilder {
        private UUID projectMemberId;
        private Project project;
        private User user;
        private RoleCategory roleCategory;
        private Instant assignedAt;
        private Instant removedAt;
        private String status = "ACTIVE";

        public ProjectMemberBuilder projectMemberId(UUID projectMemberId) { this.projectMemberId = projectMemberId; return this; }
        public ProjectMemberBuilder project(Project project) { this.project = project; return this; }
        public ProjectMemberBuilder user(User user) { this.user = user; return this; }
        public ProjectMemberBuilder roleCategory(RoleCategory roleCategory) { this.roleCategory = roleCategory; return this; }
        public ProjectMemberBuilder assignedAt(Instant assignedAt) { this.assignedAt = assignedAt; return this; }
        public ProjectMemberBuilder removedAt(Instant removedAt) { this.removedAt = removedAt; return this; }
        public ProjectMemberBuilder status(String status) { this.status = status; return this; }

        public ProjectMember build() {
            return new ProjectMember(projectMemberId, project, user, roleCategory, assignedAt, removedAt, status);
        }
    }

    public UUID getProjectMemberId() { return projectMemberId; }
    public void setProjectMemberId(UUID projectMemberId) { this.projectMemberId = projectMemberId; }
    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public RoleCategory getRoleCategory() { return roleCategory; }
    public void setRoleCategory(RoleCategory roleCategory) { this.roleCategory = roleCategory; }
    public Instant getAssignedAt() { return assignedAt; }
    public void setAssignedAt(Instant assignedAt) { this.assignedAt = assignedAt; }
    public Instant getRemovedAt() { return removedAt; }
    public void setRemovedAt(Instant removedAt) { this.removedAt = removedAt; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
