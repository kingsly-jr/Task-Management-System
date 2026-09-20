package com.taskflow.bug.repository;

import com.taskflow.bug.entity.Bug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BugRepository extends JpaRepository<Bug, UUID>, JpaSpecificationExecutor<Bug> {

    List<Bug> findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID projectId);

    List<Bug> findByAssignedTo_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId);

    List<Bug> findByReportedBy_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId);

    Optional<Bug> findByBugCodeIgnoreCaseAndIsDeletedFalse(String bugCode);

    boolean existsByBugCodeIgnoreCaseAndIsDeletedFalse(String bugCode);

    long countByProject_ProjectIdAndIsDeletedFalse(UUID projectId);

    long countByProject_ProjectIdAndStatusAndIsDeletedFalse(UUID projectId, String status);

    long countByProject_ProjectIdAndSeverityAndIsDeletedFalse(UUID projectId, String severity);

    long countByAssignedTo_UserIdAndStatusAndIsDeletedFalse(UUID userId, String status);
}
