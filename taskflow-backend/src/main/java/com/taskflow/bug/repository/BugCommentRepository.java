package com.taskflow.bug.repository;

import com.taskflow.bug.entity.BugComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface BugCommentRepository extends JpaRepository<BugComment, Long> {

    List<BugComment> findByBug_BugIdOrderByCreatedAtAsc(Long bugId);

    long countByBug_BugId(Long bugId);
}
