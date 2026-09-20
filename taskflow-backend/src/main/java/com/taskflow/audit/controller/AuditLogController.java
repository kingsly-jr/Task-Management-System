package com.taskflow.audit.controller;

import com.taskflow.audit.dto.AuditLogDto;
import com.taskflow.audit.service.AuditLogService;
import com.taskflow.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/audit-logs")
@Tag(name = "Audit Logs", description = "Endpoints for viewing and exporting system audit trails (Admin only)")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit logs with search, filtering, and pagination")
    public ResponseEntity<ApiResponse<AuditLogDto.PageResponse>> getAuditLogs(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Instant startDate,
            @RequestParam(required = false) Instant endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        AuditLogDto.PageResponse response = auditLogService.getAuditLogs(
                module, action, status, search, startDate, endDate, page, size
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get audit metrics summary")
    public ResponseEntity<ApiResponse<AuditLogDto.StatsResponse>> getStats() {
        AuditLogDto.StatsResponse stats = auditLogService.getStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export audit logs as CSV")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String module,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search
    ) {
        List<AuditLogDto.Response> logs = auditLogService.getAllForExport(module, action, status, search);

        StringBuilder sb = new StringBuilder();
        sb.append("ID,Timestamp,Actor Email,Actor Role,Module,Action,Target Entity,Target ID,Status,IP Address,Details\n");

        for (AuditLogDto.Response log : logs) {
            sb.append(log.getId()).append(",");
            sb.append(log.getTimestamp() != null ? log.getTimestamp().toString() : "").append(",");
            sb.append(escapeCsv(log.getActorEmail())).append(",");
            sb.append(escapeCsv(log.getActorRole())).append(",");
            sb.append(escapeCsv(log.getModule())).append(",");
            sb.append(escapeCsv(log.getAction())).append(",");
            sb.append(escapeCsv(log.getTargetEntity())).append(",");
            sb.append(escapeCsv(log.getTargetId())).append(",");
            sb.append(escapeCsv(log.getStatus())).append(",");
            sb.append(escapeCsv(log.getIpAddress())).append(",");
            sb.append(escapeCsv(log.getDetails())).append("\n");
        }

        byte[] bytes = sb.toString().getBytes(StandardCharsets.UTF_8);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"taskflow_audit_logs.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(bytes);
    }

    private String escapeCsv(String value) {
        if (value == null) return "";
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\"") || escaped.contains("\n")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }
}
