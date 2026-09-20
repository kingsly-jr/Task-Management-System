package com.taskflow.bug.repository;

import com.taskflow.bug.entity.BugComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BugCommentRepository extends JpaRepository<BugComment, UUID> {

    List<BugComment> findByBug_BugIdOrderByCreatedAtAsc(UUID bugId);

    long countByBug_BugId(UUID bugId);
}
