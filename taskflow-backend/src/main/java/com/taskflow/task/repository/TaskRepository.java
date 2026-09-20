package com.taskflow.task.repository;

import com.taskflow.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    List<Task> findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID projectId);

    List<Task> findByProject_ProjectIdAndStatusAndIsDeletedFalse(UUID projectId, String status);

    @Query("SELECT DISTINCT t FROM Task t JOIN t.assignees a WHERE a.userId = :userId AND t.isDeleted = false ORDER BY t.dueDate ASC NULLS LAST")
    List<Task> findByAssigneeUserId(@Param("userId") UUID userId);

    @Query("SELECT DISTINCT t FROM Task t JOIN t.assignees a WHERE a.userId = :userId AND t.status = :status AND t.isDeleted = false")
    List<Task> findByAssigneeUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);

    boolean existsByTaskCodeIgnoreCaseAndIsDeletedFalse(String taskCode);

    long countByProject_ProjectIdAndIsDeletedFalse(UUID projectId);

    long countByProject_ProjectIdAndStatusAndIsDeletedFalse(UUID projectId, String status);

    @Query("SELECT COUNT(DISTINCT t) FROM Task t JOIN t.assignees a WHERE a.userId = :userId AND t.isDeleted = false")
    long countByAssigneeUserId(@Param("userId") UUID userId);

    @Query("SELECT COUNT(DISTINCT t) FROM Task t JOIN t.assignees a WHERE a.userId = :userId AND t.status = :status AND t.isDeleted = false")
    long countByAssigneeUserIdAndStatus(@Param("userId") UUID userId, @Param("status") String status);

    long countByMilestone_MilestoneIdAndIsDeletedFalse(UUID milestoneId);

    long countByMilestone_MilestoneIdAndStatusAndIsDeletedFalse(UUID milestoneId, String status);

    List<Task> findByMilestone_MilestoneIdAndIsDeletedFalseOrderByCreatedAtAsc(UUID milestoneId);
}
