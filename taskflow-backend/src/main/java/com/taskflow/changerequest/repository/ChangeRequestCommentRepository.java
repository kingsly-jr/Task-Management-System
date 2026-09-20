package com.taskflow.changerequest.repository;

import com.taskflow.changerequest.entity.ChangeRequestComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChangeRequestCommentRepository extends JpaRepository<ChangeRequestComment, UUID> {

    List<ChangeRequestComment> findByChangeRequest_ChangeRequestIdOrderByCreatedAtAsc(UUID changeRequestId);

    long countByChangeRequest_ChangeRequestId(UUID changeRequestId);
}
