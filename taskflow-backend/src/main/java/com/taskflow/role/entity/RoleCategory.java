package com.taskflow.role.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "role_categories")
@EntityListeners(AuditingEntityListener.class)
public class RoleCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_category_id")
    private Long roleCategoryId;

    @Column(name = "role_category_name", nullable = false, length = 100)
    private String roleCategoryName;

    @Column(name = "role_category_code", nullable = false, unique = true, length = 100)
    private String roleCategoryCode;

    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    public RoleCategory() {}

    public RoleCategory(Long roleCategoryId, String roleCategoryName, String roleCategoryCode,
                        String description, String status, Instant createdAt, Instant updatedAt) {
        this.roleCategoryId = roleCategoryId;
        this.roleCategoryName = roleCategoryName;
        this.roleCategoryCode = roleCategoryCode;
        this.description = description;
        this.status = status != null ? status : "ACTIVE";
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static RoleCategoryBuilder builder() {
        return new RoleCategoryBuilder();
    }

    public static class RoleCategoryBuilder {
        private Long roleCategoryId;
        private String roleCategoryName;
        private String roleCategoryCode;
        private String description;
        private String status = "ACTIVE";
        private Instant createdAt;
        private Instant updatedAt;

        public RoleCategoryBuilder roleCategoryId(Long roleCategoryId) { this.roleCategoryId = roleCategoryId; return this; }
        public RoleCategoryBuilder roleCategoryName(String roleCategoryName) { this.roleCategoryName = roleCategoryName; return this; }
        public RoleCategoryBuilder roleCategoryCode(String roleCategoryCode) { this.roleCategoryCode = roleCategoryCode; return this; }
        public RoleCategoryBuilder description(String description) { this.description = description; return this; }
        public RoleCategoryBuilder status(String status) { this.status = status; return this; }
        public RoleCategoryBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public RoleCategoryBuilder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public RoleCategory build() {
            return new RoleCategory(roleCategoryId, roleCategoryName, roleCategoryCode, description, status, createdAt, updatedAt);
        }
    }

    public Long getRoleCategoryId() { return roleCategoryId; }
    public void setRoleCategoryId(Long roleCategoryId) { this.roleCategoryId = roleCategoryId; }
    public String getRoleCategoryName() { return roleCategoryName; }
    public void setRoleCategoryName(String roleCategoryName) { this.roleCategoryName = roleCategoryName; }
    public String getRoleCategoryCode() { return roleCategoryCode; }
    public void setRoleCategoryCode(String roleCategoryCode) { this.roleCategoryCode = roleCategoryCode; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
