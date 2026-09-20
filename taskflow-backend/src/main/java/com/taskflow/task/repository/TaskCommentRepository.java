package com.taskflow.task.repository;

import com.taskflow.task.entity.TaskComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TaskCommentRepository extends JpaRepository<TaskComment, UUID> {
    List<TaskComment> findByTask_TaskIdOrderByCreatedAtAsc(UUID taskId);
}
