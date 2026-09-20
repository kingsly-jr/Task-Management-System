package com.taskflow.audit.service;

import com.taskflow.audit.dto.AuditLogDto;
import com.taskflow.audit.entity.AuditLog;
import com.taskflow.audit.repository.AuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog log(String actorEmail, String actorRole, String module, String action,
                        String targetEntity, String targetId, String details,
                        String ipAddress, String status, String metadataJson) {
        AuditLog auditLog = new AuditLog(
                actorEmail,
                actorRole,
                module,
                action,
                targetEntity,
                targetId,
                details,
                ipAddress != null ? ipAddress : "127.0.0.1",
                status != null ? status : "SUCCESS",
                metadataJson
        );
        return auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public AuditLogDto.PageResponse getAuditLogs(
            String module,
            String action,
            String status,
            String search,
            Instant startDate,
            Instant endDate,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<AuditLog> auditPage = auditLogRepository.findWithFilters(
                module, action, status, search, startDate, endDate, pageable
        );

        List<AuditLogDto.Response> content = auditPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new AuditLogDto.PageResponse(
                content,
                auditPage.getNumber(),
                auditPage.getSize(),
                auditPage.getTotalElements(),
                auditPage.getTotalPages(),
                auditPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto.Response> getAllForExport(String module, String action, String status, String search) {
        List<AuditLog> list = auditLogRepository.findWithFiltersList(module, action, status, search);
        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AuditLogDto.StatsResponse getStats() {
        long total = auditLogRepository.count();
        long authEvents = auditLogRepository.countByModule("AUTH");
        long securityAlerts = auditLogRepository.countByStatus("WARNING") + auditLogRepository.countByStatus("FAILED");
        long mutations = total - authEvents;
        if (mutations < 0) mutations = 0;

        return new AuditLogDto.StatsResponse(total, authEvents, mutations, securityAlerts);
    }

    private AuditLogDto.Response mapToResponse(AuditLog log) {
        return new AuditLogDto.Response(
                log.getId(),
                log.getCreatedAt(),
                log.getActorEmail(),
                log.getActorRole(),
                log.getModule(),
                log.getAction(),
                log.getTargetEntity(),
                log.getTargetId(),
                log.getDetails(),
                log.getIpAddress(),
                log.getStatus(),
                log.getMetadataJson()
        );
    }
}
