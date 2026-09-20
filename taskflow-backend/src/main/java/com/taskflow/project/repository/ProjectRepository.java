package com.taskflow.project.repository;

import com.taskflow.project.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID>, JpaSpecificationExecutor<Project> {
    Optional<Project> findByProjectCodeIgnoreCaseAndIsDeletedFalse(String projectCode);
    boolean existsByProjectCodeIgnoreCaseAndIsDeletedFalse(String projectCode);
    List<Project> findByIsDeletedFalse();
    List<Project> findByProjectManager_UserIdAndIsDeletedFalse(UUID projectManagerId);
    Page<Project> findByProjectManager_UserIdAndIsDeletedFalse(UUID projectManagerId, Pageable pageable);
    List<Project> findByClient_ClientIdAndIsDeletedFalse(UUID clientId);
    List<Project> findByClient_User_UserIdAndIsDeletedFalse(UUID userId);
    Page<Project> findByClient_User_UserIdAndIsDeletedFalse(UUID userId, Pageable pageable);
    long countByIsDeletedFalse();
    long countByStatusAndIsDeletedFalse(String status);
    long countByProjectManager_UserIdAndIsDeletedFalse(UUID projectManagerId);
    long countByProjectManager_UserIdAndStatusAndIsDeletedFalse(UUID projectManagerId, String status);
}
