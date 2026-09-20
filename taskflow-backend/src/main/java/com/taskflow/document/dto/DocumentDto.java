package com.taskflow.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class DocumentDto {

    public static class UploadDocumentRequest {
        @NotBlank(message = "Document title is required")
        @Size(min = 2, max = 255)
        private String title;

        private String category = "OTHER";
        private String description;
        private boolean isClientVisible = true;

        public UploadDocumentRequest() {}

        public UploadDocumentRequest(String title, String category, String description, boolean isClientVisible) {
            this.title = title;
            this.category = category;
            this.description = description;
            this.isClientVisible = isClientVisible;
        }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public boolean isClientVisible() { return isClientVisible; }
        public void setClientVisible(boolean clientVisible) { isClientVisible = clientVisible; }
    }

    public static class UploadVersionRequest {
        private String changeLog;

        public UploadVersionRequest() {}
        public UploadVersionRequest(String changeLog) { this.changeLog = changeLog; }

        public String getChangeLog() { return changeLog; }
        public void setChangeLog(String changeLog) { this.changeLog = changeLog; }
    }

    public static class DocumentResponse {
        private UUID documentId;
        private UUID projectId;
        private String projectCode;
        private String projectName;
        private String title;
        private String category;
        private String fileName;
        private String fileExtension;
        private Long fileSize;
        private String fileSizeFormatted;
        private String mimeType;
        private String description;
        private Integer version;
        private boolean isClientVisible;
        private UUID uploadedById;
        private String uploadedByName;
        private String uploadedByEmail;
        private Instant createdAt;
        private Instant updatedAt;

        public DocumentResponse() {}

        public DocumentResponse(UUID documentId, UUID projectId, String projectCode, String projectName,
                                String title, String category, String fileName, String fileExtension,
                                Long fileSize, String fileSizeFormatted, String mimeType, String description,
                                Integer version, boolean isClientVisible, UUID uploadedById,
                                String uploadedByName, String uploadedByEmail, Instant createdAt, Instant updatedAt) {
            this.documentId = documentId;
            this.projectId = projectId;
            this.projectCode = projectCode;
            this.projectName = projectName;
            this.title = title;
            this.category = category;
            this.fileName = fileName;
            this.fileExtension = fileExtension;
            this.fileSize = fileSize;
            this.fileSizeFormatted = fileSizeFormatted;
            this.mimeType = mimeType;
            this.description = description;
            this.version = version;
            this.isClientVisible = isClientVisible;
            this.uploadedById = uploadedById;
            this.uploadedByName = uploadedByName;
            this.uploadedByEmail = uploadedByEmail;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public UUID getDocumentId() { return documentId; }
        public void setDocumentId(UUID documentId) { this.documentId = documentId; }
        public UUID getProjectId() { return projectId; }
        public void setProjectId(UUID projectId) { this.projectId = projectId; }
        public String getProjectCode() { return projectCode; }
        public void setProjectCode(String projectCode) { this.projectCode = projectCode; }
        public String getProjectName() { return projectName; }
        public void setProjectName(String projectName) { this.projectName = projectName; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public String getFileExtension() { return fileExtension; }
        public void setFileExtension(String fileExtension) { this.fileExtension = fileExtension; }
        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
        public String getFileSizeFormatted() { return fileSizeFormatted; }
        public void setFileSizeFormatted(String fileSizeFormatted) { this.fileSizeFormatted = fileSizeFormatted; }
        public String getMimeType() { return mimeType; }
        public void setMimeType(String mimeType) { this.mimeType = mimeType; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Integer getVersion() { return version; }
        public void setVersion(Integer version) { this.version = version; }
        public boolean isClientVisible() { return isClientVisible; }
        public void setClientVisible(boolean clientVisible) { isClientVisible = clientVisible; }
        public UUID getUploadedById() { return uploadedById; }
        public void setUploadedById(UUID uploadedById) { this.uploadedById = uploadedById; }
        public String getUploadedByName() { return uploadedByName; }
        public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }
        public String getUploadedByEmail() { return uploadedByEmail; }
        public void setUploadedByEmail(String uploadedByEmail) { this.uploadedByEmail = uploadedByEmail; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
        public Instant getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class VersionResponse {
        private UUID versionId;
        private Integer versionNumber;
        private String fileName;
        private Long fileSize;
        private String fileSizeFormatted;
        private String changeLog;
        private UUID uploadedById;
        private String uploadedByName;
        private Instant createdAt;

        public VersionResponse() {}

        public VersionResponse(UUID versionId, Integer versionNumber, String fileName,
                               Long fileSize, String fileSizeFormatted, String changeLog,
                               UUID uploadedById, String uploadedByName, Instant createdAt) {
            this.versionId = versionId;
            this.versionNumber = versionNumber;
            this.fileName = fileName;
            this.fileSize = fileSize;
            this.fileSizeFormatted = fileSizeFormatted;
            this.changeLog = changeLog;
            this.uploadedById = uploadedById;
            this.uploadedByName = uploadedByName;
            this.createdAt = createdAt;
        }

        public UUID getVersionId() { return versionId; }
        public void setVersionId(UUID versionId) { this.versionId = versionId; }
        public Integer getVersionNumber() { return versionNumber; }
        public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
        public String getFileName() { return fileName; }
        public void setFileName(String fileName) { this.fileName = fileName; }
        public Long getFileSize() { return fileSize; }
        public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
        public String getFileSizeFormatted() { return fileSizeFormatted; }
        public void setFileSizeFormatted(String fileSizeFormatted) { this.fileSizeFormatted = fileSizeFormatted; }
        public String getChangeLog() { return changeLog; }
        public void setChangeLog(String changeLog) { this.changeLog = changeLog; }
        public UUID getUploadedById() { return uploadedById; }
        public void setUploadedById(UUID uploadedById) { this.uploadedById = uploadedById; }
        public String getUploadedByName() { return uploadedByName; }
        public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }
        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    public static class DocumentDetailResponse extends DocumentResponse {
        private List<VersionResponse> versions = new ArrayList<>();

        public DocumentDetailResponse() {}

        public List<VersionResponse> getVersions() { return versions; }
        public void setVersions(List<VersionResponse> versions) { this.versions = versions; }
    }

    public static class DocumentStatsResponse {
        private long totalDocuments;
        private long totalBytes;
        private String totalSizeFormatted;
        private Map<String, Long> categoryCounts = new HashMap<>();

        public DocumentStatsResponse() {}

        public DocumentStatsResponse(long totalDocuments, long totalBytes, String totalSizeFormatted, Map<String, Long> categoryCounts) {
            this.totalDocuments = totalDocuments;
            this.totalBytes = totalBytes;
            this.totalSizeFormatted = totalSizeFormatted;
            this.categoryCounts = categoryCounts != null ? categoryCounts : new HashMap<>();
        }

        public long getTotalDocuments() { return totalDocuments; }
        public void setTotalDocuments(long totalDocuments) { this.totalDocuments = totalDocuments; }
        public long getTotalBytes() { return totalBytes; }
        public void setTotalBytes(long totalBytes) { this.totalBytes = totalBytes; }
        public String getTotalSizeFormatted() { return totalSizeFormatted; }
        public void setTotalSizeFormatted(String totalSizeFormatted) { this.totalSizeFormatted = totalSizeFormatted; }
        public Map<String, Long> getCategoryCounts() { return categoryCounts; }
        public void setCategoryCounts(Map<String, Long> categoryCounts) { this.categoryCounts = categoryCounts; }
    }
}
