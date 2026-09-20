package com.taskflow.milestone.repository;

import com.taskflow.milestone.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, UUID> {

    List<Milestone> findByProject_ProjectIdAndIsDeletedFalseOrderByOrderIndexAscTargetDateAsc(UUID projectId);

    long countByProject_ProjectIdAndIsDeletedFalse(UUID projectId);

    long countByProject_ProjectIdAndStatusAndIsDeletedFalse(UUID projectId, String status);
}
