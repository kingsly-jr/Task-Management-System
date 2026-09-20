package com.taskflow.milestone.repository;

import com.taskflow.milestone.entity.Milestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface MilestoneRepository extends JpaRepository<Milestone, Long> {

    List<Milestone> findByProject_ProjectIdAndIsDeletedFalseOrderByOrderIndexAscTargetDateAsc(Long projectId);

    long countByProject_ProjectIdAndIsDeletedFalse(Long projectId);

    long countByProject_ProjectIdAndStatusAndIsDeletedFalse(Long projectId, String status);
}
