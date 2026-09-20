package com.taskflow.bug.repository;

import com.taskflow.bug.entity.Bug;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface BugRepository extends JpaRepository<Bug, Long>, JpaSpecificationExecutor<Bug> {

    List<Bug> findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(Long projectId);

    List<Bug> findByAssignedTo_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    List<Bug> findByReportedBy_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    Optional<Bug> findByBugCodeIgnoreCaseAndIsDeletedFalse(String bugCode);

    boolean existsByBugCodeIgnoreCaseAndIsDeletedFalse(String bugCode);

    long countByProject_ProjectIdAndIsDeletedFalse(Long projectId);

    long countByProject_ProjectIdAndStatusAndIsDeletedFalse(Long projectId, String status);

    long countByProject_ProjectIdAndSeverityAndIsDeletedFalse(Long projectId, String severity);

    long countByAssignedTo_UserIdAndStatusAndIsDeletedFalse(Long userId, String status);
}
