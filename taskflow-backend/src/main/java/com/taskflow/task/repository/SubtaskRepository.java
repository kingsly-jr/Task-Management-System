package com.taskflow.task.repository;

import com.taskflow.task.entity.Subtask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
    List<Subtask> findByTask_TaskIdOrderByCreatedAtAsc(Long taskId);
    long countByTask_TaskId(Long taskId);
    long countByTask_TaskIdAndIsCompletedTrue(Long taskId);
}
