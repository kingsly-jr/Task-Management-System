package com.taskflow.document.entity;

import com.taskflow.project.entity.Project;
import com.taskflow.user.entity.User;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "project_documents")
@EntityListeners(AuditingEntityListener.class)
public class ProjectDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "document_id", updatable = false, nullable = false)
    private UUID documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "category", nullable = false, length = 50)
    private String category = "OTHER";

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "stored_file_name", nullable = false, length = 255)
    private String storedFileName;

    @Column(name = "file_extension", length = 20)
    private String fileExtension;

    @Column(name = "file_size", nullable = false)
    private Long fileSize = 0L;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @Column(name = "file_path", nullable = false, length = 500)
    private String filePath;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "version", nullable = false)
    private Integer version = 1;

    @Column(name = "is_client_visible", nullable = false)
    private boolean isClientVisible = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by", nullable = false)
    private User uploadedBy;

    @Column(name = "is_deleted", nullable = false)
    private boolean isDeleted = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();

    public ProjectDocument() {}

    public static Builder builder() {
        return new Builder();
    }

    public UUID getDocumentId() { return documentId; }
    public void setDocumentId(UUID documentId) { this.documentId = documentId; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getStoredFileName() { return storedFileName; }
    public void setStoredFileName(String storedFileName) { this.storedFileName = storedFileName; }

    public String getFileExtension() { return fileExtension; }
    public void setFileExtension(String fileExtension) { this.fileExtension = fileExtension; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public boolean isClientVisible() { return isClientVisible; }
    public void setClientVisible(boolean clientVisible) { isClientVisible = clientVisible; }

    public User getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public static class Builder {
        private Project project;
        private String title;
        private String category = "OTHER";
        private String fileName;
        private String storedFileName;
        private String fileExtension;
        private Long fileSize = 0L;
        private String mimeType;
        private String filePath;
        private String description;
        private Integer version = 1;
        private boolean isClientVisible = true;
        private User uploadedBy;
        private boolean isDeleted = false;

        public Builder project(Project project) { this.project = project; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder fileName(String fileName) { this.fileName = fileName; return this; }
        public Builder storedFileName(String storedFileName) { this.storedFileName = storedFileName; return this; }
        public Builder fileExtension(String fileExtension) { this.fileExtension = fileExtension; return this; }
        public Builder fileSize(Long fileSize) { this.fileSize = fileSize; return this; }
        public Builder mimeType(String mimeType) { this.mimeType = mimeType; return this; }
        public Builder filePath(String filePath) { this.filePath = filePath; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder version(Integer version) { this.version = version; return this; }
        public Builder isClientVisible(boolean isClientVisible) { this.isClientVisible = isClientVisible; return this; }
        public Builder uploadedBy(User uploadedBy) { this.uploadedBy = uploadedBy; return this; }
        public Builder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }

        public ProjectDocument build() {
            ProjectDocument doc = new ProjectDocument();
            doc.setProject(this.project);
            doc.setTitle(this.title);
            doc.setCategory(this.category != null ? this.category : "OTHER");
            doc.setFileName(this.fileName);
            doc.setStoredFileName(this.storedFileName);
            doc.setFileExtension(this.fileExtension);
            doc.setFileSize(this.fileSize != null ? this.fileSize : 0L);
            doc.setMimeType(this.mimeType);
            doc.setFilePath(this.filePath);
            doc.setDescription(this.description);
            doc.setVersion(this.version != null ? this.version : 1);
            doc.setClientVisible(this.isClientVisible);
            doc.setUploadedBy(this.uploadedBy);
            doc.setDeleted(this.isDeleted);
            doc.setCreatedAt(Instant.now());
            doc.setUpdatedAt(Instant.now());
            return doc;
        }
    }
}
