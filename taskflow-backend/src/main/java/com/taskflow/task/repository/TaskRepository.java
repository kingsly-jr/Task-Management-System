package com.taskflow.task.repository;

import com.taskflow.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(Long projectId);

    List<Task> findByProject_ProjectIdAndStatusAndIsDeletedFalse(Long projectId, String status);

    @Query("SELECT DISTINCT t FROM Task t JOIN t.assignees a WHERE a.userId = :userId AND t.isDeleted = false ORDER BY t.dueDate ASC NULLS LAST")
    List<Task> findByAssigneeUserId(@Param("userId") Long userId);

    @Query("SELECT DISTINCT t FROM Task t JOIN t.assignees a WHERE a.userId = :userId AND t.status = :status AND t.isDeleted = false")
    List<Task> findByAssigneeUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    boolean existsByTaskCodeIgnoreCaseAndIsDeletedFalse(String taskCode);

    long countByProject_ProjectIdAndIsDeletedFalse(Long projectId);

    long countByProject_ProjectIdAndStatusAndIsDeletedFalse(Long projectId, String status);

    @Query("SELECT COUNT(DISTINCT t) FROM Task t JOIN t.assignees a WHERE a.userId = :userId AND t.isDeleted = false")
    long countByAssigneeUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(DISTINCT t) FROM Task t JOIN t.assignees a WHERE a.userId = :userId AND t.status = :status AND t.isDeleted = false")
    long countByAssigneeUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    long countByMilestone_MilestoneIdAndIsDeletedFalse(Long milestoneId);

    long countByMilestone_MilestoneIdAndStatusAndIsDeletedFalse(Long milestoneId, String status);

    List<Task> findByMilestone_MilestoneIdAndIsDeletedFalseOrderByCreatedAtAsc(Long milestoneId);
}
