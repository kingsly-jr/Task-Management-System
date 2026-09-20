package com.taskflow.document.service;

import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
import com.taskflow.document.dto.DocumentDto;
import com.taskflow.document.entity.DocumentVersion;
import com.taskflow.document.entity.ProjectDocument;
import com.taskflow.document.repository.DocumentVersionRepository;
import com.taskflow.document.repository.ProjectDocumentRepository;
import com.taskflow.project.entity.Project;
import com.taskflow.project.repository.ProjectMemberRepository;
import com.taskflow.project.repository.ProjectRepository;
import com.taskflow.security.UserPrincipal;
import com.taskflow.user.entity.User;
import com.taskflow.user.repository.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentService {

    private final ProjectDocumentRepository documentRepository;
    private final DocumentVersionRepository versionRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public DocumentService(ProjectDocumentRepository documentRepository,
                           DocumentVersionRepository versionRepository,
                           ProjectRepository projectRepository,
                           ProjectMemberRepository projectMemberRepository,
                           UserRepository userRepository,
                           FileStorageService fileStorageService) {
        this.documentRepository = documentRepository;
        this.versionRepository = versionRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public DocumentDto.DocumentResponse uploadDocument(Long projectId, MultipartFile file, DocumentDto.UploadDocumentRequest request) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid file to upload");
        }

        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectUploadAccess(project, currentUser);

        User uploader = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        FileStorageService.FileUploadResult uploadResult = fileStorageService.storeFile(projectId, file);

        String category = request.getCategory() != null && !request.getCategory().isBlank()
                ? request.getCategory().toUpperCase().trim()
                : "OTHER";

        ProjectDocument doc = ProjectDocument.builder()
                .project(project)
                .title(request.getTitle().trim())
                .category(category)
                .fileName(uploadResult.getOriginalFilename())
                .storedFileName(uploadResult.getStoredFileName())
                .fileExtension(uploadResult.getFileExtension())
                .fileSize(uploadResult.getFileSize())
                .mimeType(uploadResult.getMimeType())
                .filePath(uploadResult.getRelativePath())
                .description(request.getDescription())
                .version(1)
                .isClientVisible(request.isClientVisible())
                .uploadedBy(uploader)
                .isDeleted(false)
                .build();

        ProjectDocument saved = documentRepository.save(doc);
        return mapToResponse(saved);
    }

    @Transactional
    public DocumentDto.DocumentResponse uploadNewVersion(Long documentId, MultipartFile file, String changeLog) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a valid replacement file");
        }

        ProjectDocument doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectUploadAccess(doc.getProject(), currentUser);

        User uploader = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Archive previous version snapshot
        DocumentVersion versionArchive = DocumentVersion.builder()
                .document(doc)
                .versionNumber(doc.getVersion())
                .fileName(doc.getFileName())
                .storedFileName(doc.getStoredFileName())
                .fileSize(doc.getFileSize())
                .filePath(doc.getFilePath())
                .changeLog(changeLog != null && !changeLog.isBlank() ? changeLog.trim() : "Updated version " + (doc.getVersion() + 1))
                .uploadedBy(uploader)
                .build();
        versionRepository.save(versionArchive);

        // Store new file to disk
        FileStorageService.FileUploadResult uploadResult = fileStorageService.storeFile(doc.getProject().getProjectId(), file);

        // Update document with new version details
        doc.setVersion(doc.getVersion() + 1);
        doc.setFileName(uploadResult.getOriginalFilename());
        doc.setStoredFileName(uploadResult.getStoredFileName());
        doc.setFileExtension(uploadResult.getFileExtension());
        doc.setFileSize(uploadResult.getFileSize());
        doc.setMimeType(uploadResult.getMimeType());
        doc.setFilePath(uploadResult.getRelativePath());
        doc.setUploadedBy(uploader);
        doc.setUpdatedAt(Instant.now());

        ProjectDocument updated = documentRepository.save(doc);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<DocumentDto.DocumentResponse> getDocumentsForProject(Long projectId, String category, String search) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        boolean isClient = "CLIENT".equalsIgnoreCase(currentUser.getRoleCode());
        verifyProjectViewAccess(project, currentUser);

        List<ProjectDocument> docs;
        if (isClient) {
            docs = documentRepository.findByProject_ProjectIdAndIsClientVisibleTrueAndIsDeletedFalseOrderByCreatedAtDesc(projectId);
        } else {
            docs = documentRepository.findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(projectId);
        }

        return docs.stream()
                .filter(d -> {
                    boolean matchCategory = category == null || category.isBlank() || "ALL".equalsIgnoreCase(category) ||
                            d.getCategory().equalsIgnoreCase(category);
                    boolean matchSearch = search == null || search.isBlank() ||
                            d.getTitle().toLowerCase().contains(search.toLowerCase()) ||
                            d.getFileName().toLowerCase().contains(search.toLowerCase());
                    return matchCategory && matchSearch;
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentDto.DocumentDetailResponse getDocumentById(Long documentId) {
        ProjectDocument doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyDocumentAccess(doc, currentUser);

        DocumentDto.DocumentResponse base = mapToResponse(doc);
        DocumentDto.DocumentDetailResponse detail = new DocumentDto.DocumentDetailResponse();
        copyProperties(base, detail);

        List<DocumentVersion> versions = versionRepository.findByDocument_DocumentIdOrderByVersionNumberDesc(documentId);
        detail.setVersions(versions.stream().map(v -> new DocumentDto.VersionResponse(
                v.getVersionId(),
                v.getVersionNumber(),
                v.getFileName(),
                v.getFileSize(),
                formatFileSize(v.getFileSize()),
                v.getChangeLog(),
                v.getUploadedBy().getUserId(),
                v.getUploadedBy().getFirstName() + " " + v.getUploadedBy().getLastName(),
                v.getCreatedAt()
        )).collect(Collectors.toList()));

        return detail;
    }

    @Transactional(readOnly = true)
    public DocumentDownload loadDocumentFile(Long documentId) {
        ProjectDocument doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyDocumentAccess(doc, currentUser);

        Resource resource = fileStorageService.loadFileAsResource(doc.getFilePath());
        return new DocumentDownload(resource, doc.getFileName(), doc.getMimeType());
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        ProjectDocument doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with id: " + documentId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        if (!hasManageAccess(doc.getProject(), currentUser)) {
            throw new AccessDeniedException("Only the Project Manager or Admin can delete documents");
        }

        doc.setDeleted(true);
        doc.setUpdatedAt(Instant.now());
        documentRepository.save(doc);
    }

    @Transactional(readOnly = true)
    public DocumentDto.DocumentStatsResponse getDocumentStats(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .filter(p -> !p.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + projectId));

        UserPrincipal currentUser = getCurrentUserPrincipal();
        verifyProjectViewAccess(project, currentUser);

        long totalCount = documentRepository.countByProject_ProjectIdAndIsDeletedFalse(projectId);
        Long totalBytes = documentRepository.sumFileSizeByProjectId(projectId);
        if (totalBytes == null) totalBytes = 0L;

        List<Object[]> categoryCountsRaw = documentRepository.countByCategoryForProject(projectId);
        Map<String, Long> categoryCounts = new HashMap<>();
        for (Object[] row : categoryCountsRaw) {
            String cat = (String) row[0];
            Long cnt = (Long) row[1];
            categoryCounts.put(cat, cnt);
        }

        return new DocumentDto.DocumentStatsResponse(
                totalCount,
                totalBytes,
                formatFileSize(totalBytes),
                categoryCounts
        );
    }

    private void verifyProjectUploadAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRoleCode();
        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            if (!project.getProjectManager().getUserId().equals(currentUser.getId())) {
                throw new AccessDeniedException("You do not manage this project");
            }
            return;
        }

        if ("TEAM_MEMBER".equalsIgnoreCase(role)) {
            boolean isMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserIdAndStatus(
                    project.getProjectId(), currentUser.getId(), "ACTIVE");
            if (!isMember) {
                throw new AccessDeniedException("You are not an active member of this project team");
            }
            return;
        }

        throw new AccessDeniedException("Clients cannot upload internal project documents");
    }

    private void verifyProjectViewAccess(Project project, UserPrincipal currentUser) {
        String role = currentUser.getRoleCode();
        Long userId = currentUser.getId();

        if ("ADMIN".equalsIgnoreCase(role)) return;

        if ("PROJECT_MANAGER".equalsIgnoreCase(role)) {
            if (!project.getProjectManager().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not manage this project");
            }
            return;
        }

        if ("CLIENT".equalsIgnoreCase(role)) {
            if (project.getClient().getUser() == null || !project.getClient().getUser().getUserId().equals(userId)) {
                throw new AccessDeniedException("You do not have access to documents for this project");
            }
            return;
        }

        boolean isMember = projectMemberRepository.existsByProject_ProjectIdAndUser_UserIdAndStatus(
                project.getProjectId(), userId, "ACTIVE");
        if (!isMember) {
            throw new AccessDeniedException("You are not an active member of this project team");
        }
    }

    private void verifyDocumentAccess(ProjectDocument doc, UserPrincipal currentUser) {
        verifyProjectViewAccess(doc.getProject(), currentUser);
        if ("CLIENT".equalsIgnoreCase(currentUser.getRoleCode()) && !doc.isClientVisible()) {
            throw new AccessDeniedException("This internal document is not accessible to clients");
        }
    }

    private boolean hasManageAccess(Project project, UserPrincipal currentUser) {
        if ("ADMIN".equalsIgnoreCase(currentUser.getRoleCode())) return true;
        return "PROJECT_MANAGER".equalsIgnoreCase(currentUser.getRoleCode()) &&
                project.getProjectManager().getUserId().equals(currentUser.getId());
    }

    private UserPrincipal getCurrentUserPrincipal() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User not authenticated");
        }
        return (UserPrincipal) auth.getPrincipal();
    }

    private DocumentDto.DocumentResponse mapToResponse(ProjectDocument doc) {
        return new DocumentDto.DocumentResponse(
                doc.getDocumentId(),
                doc.getProject().getProjectId(),
                doc.getProject().getProjectCode(),
                doc.getProject().getProjectName(),
                doc.getTitle(),
                doc.getCategory(),
                doc.getFileName(),
                doc.getFileExtension(),
                doc.getFileSize(),
                formatFileSize(doc.getFileSize()),
                doc.getMimeType(),
                doc.getDescription(),
                doc.getVersion(),
                doc.isClientVisible(),
                doc.getUploadedBy().getUserId(),
                doc.getUploadedBy().getFirstName() + " " + doc.getUploadedBy().getLastName(),
                doc.getUploadedBy().getEmail(),
                doc.getCreatedAt(),
                doc.getUpdatedAt()
        );
    }

    private void copyProperties(DocumentDto.DocumentResponse src, DocumentDto.DocumentDetailResponse dest) {
        dest.setDocumentId(src.getDocumentId());
        dest.setProjectId(src.getProjectId());
        dest.setProjectCode(src.getProjectCode());
        dest.setProjectName(src.getProjectName());
        dest.setTitle(src.getTitle());
        dest.setCategory(src.getCategory());
        dest.setFileName(src.getFileName());
        dest.setFileExtension(src.getFileExtension());
        dest.setFileSize(src.getFileSize());
        dest.setFileSizeFormatted(src.getFileSizeFormatted());
        dest.setMimeType(src.getMimeType());
        dest.setDescription(src.getDescription());
        dest.setVersion(src.getVersion());
        dest.setClientVisible(src.isClientVisible());
        dest.setUploadedById(src.getUploadedById());
        dest.setUploadedByName(src.getUploadedByName());
        dest.setUploadedByEmail(src.getUploadedByEmail());
        dest.setCreatedAt(src.getCreatedAt());
        dest.setUpdatedAt(src.getUpdatedAt());
    }

    public static String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        String pre = "KMGTPE".charAt(exp - 1) + "";
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }

    public static class DocumentDownload {
        private final Resource resource;
        private final String fileName;
        private final String mimeType;

        public DocumentDownload(Resource resource, String fileName, String mimeType) {
            this.resource = resource;
            this.fileName = fileName;
            this.mimeType = mimeType;
        }

        public Resource getResource() { return resource; }
        public String getFileName() { return fileName; }
        public String getMimeType() { return mimeType; }
    }
}
