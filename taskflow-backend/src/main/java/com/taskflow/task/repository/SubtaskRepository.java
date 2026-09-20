package com.taskflow.task.repository;

import com.taskflow.task.entity.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, UUID> {
    List<Subtask> findByTask_TaskIdOrderByCreatedAtAsc(UUID taskId);
    long countByTask_TaskId(UUID taskId);
    long countByTask_TaskIdAndIsCompletedTrue(UUID taskId);
}
