package com.taskflow.client.repository;

import com.taskflow.client.entity.Client;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;


@Repository
public interface ClientRepository extends JpaRepository<Client, Long>, JpaSpecificationExecutor<Client> {
    Optional<Client> findByEmailIgnoreCaseAndIsDeletedFalse(String email);
    Optional<Client> findByUser_UserIdAndIsDeletedFalse(Long userId);
    boolean existsByEmailIgnoreCaseAndIsDeletedFalse(String email);
    List<Client> findByStatusAndIsDeletedFalse(String status);
    List<Client> findByIsDeletedFalse();
    long countByIsDeletedFalse();
    long countByStatusAndIsDeletedFalse(String status);
}
