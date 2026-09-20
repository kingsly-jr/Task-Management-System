package com.taskflow.document.repository;

import com.taskflow.document.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

    List<DocumentVersion> findByDocument_DocumentIdOrderByVersionNumberDesc(Long documentId);

    long countByDocument_DocumentId(Long documentId);
}
