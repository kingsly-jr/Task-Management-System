package com.taskflow.project.repository;

import com.taskflow.project.entity.ProjectMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ProjectMemberRepository extends JpaRepository<ProjectMember, Long> {
    List<ProjectMember> findByProject_ProjectIdAndStatusOrderByAssignedAtDesc(Long projectId, String status);
    List<ProjectMember> findByUser_UserIdAndStatus(Long userId, String status);
    boolean existsByProject_ProjectIdAndUser_UserIdAndStatus(Long projectId, Long userId, String status);
    Optional<ProjectMember> findByProject_ProjectIdAndUser_UserIdAndStatus(Long projectId, Long userId, String status);
    long countByUser_UserIdAndStatus(Long userId, String status);
    long countByProject_ProjectIdAndStatus(Long projectId, String status);
}
