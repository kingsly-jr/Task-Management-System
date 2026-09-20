package com.taskflow.project.repository;

import com.taskflow.project.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, JpaSpecificationExecutor<Project> {
    Optional<Project> findByProjectCodeIgnoreCaseAndIsDeletedFalse(String projectCode);
    boolean existsByProjectCodeIgnoreCaseAndIsDeletedFalse(String projectCode);
    List<Project> findByIsDeletedFalse();
    List<Project> findByProjectManager_UserIdAndIsDeletedFalse(Long projectManagerId);
    Page<Project> findByProjectManager_UserIdAndIsDeletedFalse(Long projectManagerId, Pageable pageable);
    List<Project> findByClient_ClientIdAndIsDeletedFalse(Long clientId);
    List<Project> findByClient_User_UserIdAndIsDeletedFalse(Long userId);
    Page<Project> findByClient_User_UserIdAndIsDeletedFalse(Long userId, Pageable pageable);
    long countByIsDeletedFalse();
    long countByStatusAndIsDeletedFalse(String status);
    long countByProjectManager_UserIdAndIsDeletedFalse(Long projectManagerId);
    long countByProjectManager_UserIdAndStatusAndIsDeletedFalse(Long projectManagerId, String status);
}
