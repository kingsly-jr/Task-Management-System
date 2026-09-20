package com.taskflow.document.repository;

import com.taskflow.document.entity.ProjectDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ProjectDocumentRepository extends JpaRepository<ProjectDocument, Long> {

    List<ProjectDocument> findByProject_ProjectIdAndIsDeletedFalseOrderByCreatedAtDesc(Long projectId);

    List<ProjectDocument> findByProject_ProjectIdAndIsClientVisibleTrueAndIsDeletedFalseOrderByCreatedAtDesc(Long projectId);

    long countByProject_ProjectIdAndIsDeletedFalse(Long projectId);

    long countByProject_ProjectIdAndIsClientVisibleTrueAndIsDeletedFalse(Long projectId);

    @Query("SELECT COALESCE(SUM(d.fileSize), 0) FROM ProjectDocument d WHERE d.project.projectId = :projectId AND d.isDeleted = false")
    Long sumFileSizeByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT d.category, COUNT(d) FROM ProjectDocument d WHERE d.project.projectId = :projectId AND d.isDeleted = false GROUP BY d.category")
    List<Object[]> countByCategoryForProject(@Param("projectId") Long projectId);
}
