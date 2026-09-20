package com.taskflow.audit.repository;

import com.taskflow.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long>, JpaSpecificationExecutor<AuditLog> {

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:module IS NULL OR :module = 'ALL' OR a.module = :module) AND " +
           "(:action IS NULL OR :action = 'ALL' OR a.action = :action) AND " +
           "(:status IS NULL OR :status = 'ALL' OR a.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(a.actorEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.details) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.targetEntity) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.ipAddress) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:startDate IS NULL OR a.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR a.createdAt <= :endDate) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> findWithFilters(
            @Param("module") String module,
            @Param("action") String action,
            @Param("status") String status,
            @Param("search") String search,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable
    );

    @Query("SELECT a FROM AuditLog a WHERE " +
           "(:module IS NULL OR :module = 'ALL' OR a.module = :module) AND " +
           "(:action IS NULL OR :action = 'ALL' OR a.action = :action) AND " +
           "(:status IS NULL OR :status = 'ALL' OR a.status = :status) AND " +
           "(:search IS NULL OR :search = '' OR " +
           " LOWER(a.actorEmail) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.details) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.targetEntity) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(a.ipAddress) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.createdAt DESC")
    List<AuditLog> findWithFiltersList(
            @Param("module") String module,
            @Param("action") String action,
            @Param("status") String status,
            @Param("search") String search
    );

    long countByModule(String module);

    long countByStatus(String status);
}
