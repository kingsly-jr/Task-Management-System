package com.taskflow.document.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.document.dto.DocumentDto;
import com.taskflow.document.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Document & File Management", description = "Endpoints for project document upload, categorization, multi-versioning, secure streaming download, and client visibility control")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/projects/{projectId}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER')")
    @Operation(summary = "Upload new document with metadata for a project")
    public ResponseEntity<ApiResponse<DocumentDto.DocumentResponse>> uploadDocument(
            @PathVariable UUID projectId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam(value = "category", required = false, defaultValue = "OTHER") String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "isClientVisible", required = false, defaultValue = "true") boolean isClientVisible) {

        DocumentDto.UploadDocumentRequest request = new DocumentDto.UploadDocumentRequest(title, category, description, isClientVisible);
        DocumentDto.DocumentResponse response = documentService.uploadDocument(projectId, file, request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Document uploaded successfully", response));
    }

    @PostMapping(value = "/documents/{id}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER')")
    @Operation(summary = "Upload new version of an existing document")
    public ResponseEntity<ApiResponse<DocumentDto.DocumentResponse>> uploadNewVersion(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "changeLog", required = false) String changeLog) {

        DocumentDto.DocumentResponse response = documentService.uploadNewVersion(id, file, changeLog);
        return ResponseEntity.ok(ApiResponse.ok("New version uploaded successfully", response));
    }

    @GetMapping("/projects/{projectId}/documents")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get all documents for a project with optional category and search filters")
    public ResponseEntity<ApiResponse<List<DocumentDto.DocumentResponse>>> getDocumentsForProject(
            @PathVariable UUID projectId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {

        List<DocumentDto.DocumentResponse> list = documentService.getDocumentsForProject(projectId, category, search);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/projects/{projectId}/documents/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get storage usage and category distribution statistics")
    public ResponseEntity<ApiResponse<DocumentDto.DocumentStatsResponse>> getDocumentStats(
            @PathVariable UUID projectId) {

        DocumentDto.DocumentStatsResponse stats = documentService.getDocumentStats(projectId);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/documents/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Get document metadata including full version history")
    public ResponseEntity<ApiResponse<DocumentDto.DocumentDetailResponse>> getDocumentById(
            @PathVariable UUID id) {

        DocumentDto.DocumentDetailResponse response = documentService.getDocumentById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/documents/{id}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER', 'CLIENT')")
    @Operation(summary = "Stream binary download of document file")
    public ResponseEntity<Resource> downloadDocument(@PathVariable UUID id) {
        DocumentService.DocumentDownload download = documentService.loadDocumentFile(id);

        MediaType mediaType;
        try {
            mediaType = MediaType.parseMediaType(download.getMimeType());
        } catch (Exception e) {
            mediaType = MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + download.getFileName() + "\"")
                .body(download.getResource());
    }

    @DeleteMapping("/documents/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Soft delete document (Project Manager or Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable UUID id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.ok("Document deleted successfully", null));
    }
}
