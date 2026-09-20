package com.taskflow.changerequest.repository;

import com.taskflow.changerequest.entity.ChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, UUID>, JpaSpecificationExecutor<ChangeRequest> {

    List<ChangeRequest> findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID projectId);

    List<ChangeRequest> findByRequestedBy_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID userId);

    Optional<ChangeRequest> findByChangeRequestCodeIgnoreCaseAndIsDeletedFalse(String code);

    boolean existsByChangeRequestCodeIgnoreCaseAndIsDeletedFalse(String code);

    long countByProject_ProjectIdAndIsDeletedFalse(UUID projectId);

    long countByProject_ProjectIdAndStatusAndIsDeletedFalse(UUID projectId, String status);
}
