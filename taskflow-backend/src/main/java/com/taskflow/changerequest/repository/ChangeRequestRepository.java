package com.taskflow.changerequest.repository;

import com.taskflow.changerequest.entity.ChangeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long>, JpaSpecificationExecutor<ChangeRequest> {

    List<ChangeRequest> findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(Long projectId);

    List<ChangeRequest> findByRequestedBy_UserIdAndIsDeletedFalseOrderByCreatedAtDesc(Long userId);

    Optional<ChangeRequest> findByChangeRequestCodeIgnoreCaseAndIsDeletedFalse(String code);

    boolean existsByChangeRequestCodeIgnoreCaseAndIsDeletedFalse(String code);

    long countByProject_ProjectIdAndIsDeletedFalse(Long projectId);

    long countByProject_ProjectIdAndStatusAndIsDeletedFalse(Long projectId, String status);
}
