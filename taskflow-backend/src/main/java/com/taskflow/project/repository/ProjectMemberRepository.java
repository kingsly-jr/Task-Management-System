package com.taskflow.project.repository;

import com.taskflow.project.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, UUID> {
    List<ProjectMember> findByProject_ProjectIdAndStatusOrderByAssignedAtDesc(UUID projectId, String status);
    List<ProjectMember> findByUser_UserIdAndStatus(UUID userId, String status);
    boolean existsByProject_ProjectIdAndUser_UserIdAndStatus(UUID projectId, UUID userId, String status);
    Optional<ProjectMember> findByProject_ProjectIdAndUser_UserIdAndStatus(UUID projectId, UUID userId, String status);
    long countByUser_UserIdAndStatus(UUID userId, String status);
    long countByProject_ProjectIdAndStatus(UUID projectId, String status);
}
