package com.taskflow.changerequest.repository;

import com.taskflow.changerequest.entity.ChangeRequestComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ChangeRequestCommentRepository extends JpaRepository<ChangeRequestComment, Long> {

    List<ChangeRequestComment> findByChangeRequest_ChangeRequestIdOrderByCreatedAtAsc(Long changeRequestId);

    long countByChangeRequest_ChangeRequestId(Long changeRequestId);
}
