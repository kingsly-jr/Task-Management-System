package com.taskflow.document.repository;

import com.taskflow.document.entity.ProjectDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectDocumentRepository extends JpaRepository<ProjectDocument, UUID> {

    List<ProjectDocument> findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(UUID projectId);

    List<ProjectDocument> findByProject_ProjectIdAndIsClientVisibleTrueAndIsDeletedFalseOrderByCreatedAtDesc(UUID projectId);

    long countByProject_ProjectIdAndIsDeletedFalse(UUID projectId);

    long countByProject_ProjectIdAndIsClientVisibleTrueAndIsDeletedFalse(UUID projectId);

    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM ProjectDocument d WHERE d.project.projectId = :projectId AND d.isDeleted = false")
    Long sumFileSizeByProjectId(@Param("projectId") UUID projectId);

    @Query("SELECT d.category, COUNT(d) FROM ProjectDocument d WHERE d.project.projectId = :projectId AND d.isDeleted = false GROUP BY d.category")
    List<Object[]> countByCategoryForProject(@Param("projectId") UUID projectId);
}
