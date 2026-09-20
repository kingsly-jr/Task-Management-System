package com.taskflow.message.repository;

import com.taskflow.message.entity.ProjectMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectMessageRepository extends JpaRepository<ProjectMessage, UUID> {

    @Query("SELECT m FROM ProjectMessage m WHERE m.project.projectId = :projectId AND m.channel = :channel AND m.isDeleted = false ORDER BY m.createdAt ASC")
    List<ProjectMessage> findByProject_ProjectIdAndChannelAndIsDeletedFalseOrderByCreatedAtAsc(@Param("projectId") UUID projectId, @Param("channel") String channel);

    @Query("SELECT m FROM ProjectMessage m WHERE m.project.projectId = :projectId AND m.channel = :channel AND m.isClientVisible = true AND m.isDeleted = false ORDER BY m.createdAt ASC")
    List<ProjectMessage> findByProject_ProjectIdAndChannelAndIsClientVisibleTrueAndIsDeletedFalseOrderByCreatedAtAsc(@Param("projectId") UUID projectId, @Param("channel") String channel);

    @Query("SELECT m FROM ProjectMessage m WHERE m.project.projectId = :projectId AND m.isDeleted = false ORDER BY m.createdAt ASC")
    List<ProjectMessage> findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtAsc(@Param("projectId") UUID projectId);

    @Query("SELECT m FROM ProjectMessage m WHERE m.project.projectId = :projectId AND m.isClientVisible = true AND m.isDeleted = false ORDER BY m.createdAt ASC")
    List<ProjectMessage> findByProject_ProjectIdAndIsClientVisibleTrueAndIsDeletedFalseOrderByCreatedAtAsc(@Param("projectId") UUID projectId);
}
