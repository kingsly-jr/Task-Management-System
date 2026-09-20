package com.taskflow.audit.dto;

import java.time.Instant;
import java.util.List;

public class AuditLogDto {

    public static class Response {
        private Long id;
        private Instant timestamp;
        private String actorEmail;
        private String actorRole;
        private String module;
        private String action;
        private String targetEntity;
        private String targetId;
        private String details;
        private String ipAddress;
        private String status;
        private String metadataJson;

        public Response() {}

        public Response(Long id, Instant timestamp, String actorEmail, String actorRole,
                        String module, String action, String targetEntity, String targetId,
                        String details, String ipAddress, String status, String metadataJson) {
            this.id = id;
            this.timestamp = timestamp;
            this.actorEmail = actorEmail;
            this.actorRole = actorRole;
            this.module = module;
            this.action = action;
            this.targetEntity = targetEntity;
            this.targetId = targetId;
            this.details = details;
            this.ipAddress = ipAddress;
            this.status = status;
            this.metadataJson = metadataJson;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
        public String getActorEmail() { return actorEmail; }
        public void setActorEmail(String actorEmail) { this.actorEmail = actorEmail; }
        public String getActorRole() { return actorRole; }
        public void setActorRole(String actorRole) { this.actorRole = actorRole; }
        public String getModule() { return module; }
        public void setModule(String module) { this.module = module; }
        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }
        public String getTargetEntity() { return targetEntity; }
        public void setTargetEntity(String targetEntity) { this.targetEntity = targetEntity; }
        public String getTargetId() { return targetId; }
        public void setTargetId(String targetId) { this.targetId = targetId; }
        public String getDetails() { return details; }
        public void setDetails(String details) { this.details = details; }
        public String getIpAddress() { return ipAddress; }
        public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getMetadataJson() { return metadataJson; }
        public void setMetadataJson(String metadataJson) { this.metadataJson = metadataJson; }
    }

    public static class StatsResponse {
        private long totalEvents;
        private long authEvents;
        private long mutationEvents;
        private long securityAlerts;

        public StatsResponse() {}

        public StatsResponse(long totalEvents, long authEvents, long mutationEvents, long securityAlerts) {
            this.totalEvents = totalEvents;
            this.authEvents = authEvents;
            this.mutationEvents = mutationEvents;
            this.securityAlerts = securityAlerts;
        }

        public long getTotalEvents() { return totalEvents; }
        public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }
        public long getAuthEvents() { return authEvents; }
        public void setAuthEvents(long authEvents) { this.authEvents = authEvents; }
        public long getMutationEvents() { return mutationEvents; }
        public void setMutationEvents(long mutationEvents) { this.mutationEvents = mutationEvents; }
        public long getSecurityAlerts() { return securityAlerts; }
        public void setSecurityAlerts(long securityAlerts) { this.securityAlerts = securityAlerts; }
    }

    public static class PageResponse {
        private List<Response> content;
        private int pageNumber;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean isLast;

        public PageResponse() {}

        public PageResponse(List<Response> content, int pageNumber, int pageSize,
                            long totalElements, int totalPages, boolean isLast) {
            this.content = content;
            this.pageNumber = pageNumber;
            this.pageSize = pageSize;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.isLast = isLast;
        }

        public List<Response> getContent() { return content; }
        public void setContent(List<Response> content) { this.content = content; }
        public int getPageNumber() { return pageNumber; }
        public void setPageNumber(int pageNumber) { this.pageNumber = pageNumber; }
        public int getPageSize() { return pageSize; }
        public void setPageSize(int pageSize) { this.pageSize = pageSize; }
        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
        public boolean isLast() { return isLast; }
        public void setLast(boolean last) { isLast = last; }
    }
}
