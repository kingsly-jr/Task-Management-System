package com.taskflow.document.repository;

import com.taskflow.document.entity.DocumentVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, UUID> {

    List<DocumentVersion> findByDocument_DocumentIdOrderByVersionNumberDesc(UUID documentId);

    long countByDocument_DocumentId(UUID documentId);
}
