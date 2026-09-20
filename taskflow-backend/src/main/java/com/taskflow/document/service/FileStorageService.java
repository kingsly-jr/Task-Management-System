package com.taskflow.document.service;

import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.document.config.FileStorageProperties;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    private final Path rootLocation;

    public FileStorageService(FileStorageProperties properties) {
        this.rootLocation = Paths.get(properties.getUploadDir()).toAbsolutePath().normalize();
    }

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(this.rootLocation);
            log.info("TaskFlow File Storage initialized at: {}", this.rootLocation);
        } catch (IOException e) {
            log.error("Could not initialize storage directory: {}", e.getMessage());
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public FileUploadResult storeFile(UUID projectId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Failed to store empty file");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "document");

        // Security check for path traversal
        if (originalFilename.contains("..")) {
            throw new IllegalArgumentException("Cannot store file with relative path outside current directory: " + originalFilename);
        }

        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < originalFilename.length() - 1) {
            fileExtension = originalFilename.substring(dotIndex).toLowerCase();
        }

        String storedFileName = UUID.randomUUID().toString() + fileExtension;
        Path projectFolder = this.rootLocation.resolve("projects").resolve(projectId.toString()).normalize();

        try {
            Files.createDirectories(projectFolder);
            Path destinationFile = projectFolder.resolve(storedFileName).normalize();

            // Guard against traversal out of root
            if (!destinationFile.startsWith(this.rootLocation)) {
                throw new SecurityException("Cannot store file outside current storage location");
            }

            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            String relativePath = "projects/" + projectId + "/" + storedFileName;
            String mimeType = file.getContentType();
            if (mimeType == null || mimeType.isBlank()) {
                mimeType = "application/octet-stream";
            }

            return new FileUploadResult(
                    originalFilename,
                    storedFileName,
                    fileExtension,
                    file.getSize(),
                    mimeType,
                    relativePath
            );
        } catch (IOException e) {
            log.error("Failed to store file {}: {}", originalFilename, e.getMessage());
            throw new RuntimeException("Failed to store file: " + originalFilename, e);
        }
    }

    public Resource loadFileAsResource(String relativePath) {
        try {
            Path filePath = this.rootLocation.resolve(relativePath).normalize();
            if (!filePath.startsWith(this.rootLocation)) {
                throw new SecurityException("Access to path outside storage root is prohibited");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("File not found or not readable: " + relativePath);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("File not found: " + relativePath, e);
        }
    }

    public void deleteFile(String relativePath) {
        if (relativePath == null || relativePath.isBlank()) return;
        try {
            Path filePath = this.rootLocation.resolve(relativePath).normalize();
            if (filePath.startsWith(this.rootLocation)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            log.warn("Could not delete file at {}: {}", relativePath, e.getMessage());
        }
    }

    public static class FileUploadResult {
        private final String originalFilename;
        private final String storedFileName;
        private final String fileExtension;
        private final long fileSize;
        private final String mimeType;
        private final String relativePath;

        public FileUploadResult(String originalFilename, String storedFileName, String fileExtension,
                                long fileSize, String mimeType, String relativePath) {
            this.originalFilename = originalFilename;
            this.storedFileName = storedFileName;
            this.fileExtension = fileExtension;
            this.fileSize = fileSize;
            this.mimeType = mimeType;
            this.relativePath = relativePath;
        }

        public String getOriginalFilename() { return originalFilename; }
        public String getStoredFileName() { return storedFileName; }
        public String getFileExtension() { return fileExtension; }
        public long getFileSize() { return fileSize; }
        public String getMimeType() { return mimeType; }
        public String getRelativePath() { return relativePath; }
    }
}
