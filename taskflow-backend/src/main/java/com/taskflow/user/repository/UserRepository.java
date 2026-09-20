package com.taskflow.user.repository;

import com.taskflow.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {
    Optional<User> findByEmailIgnoreCaseAndIsDeletedFalse(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmailIgnoreCase(String email);
    List<User> findByRole_RoleCodeAndIsDeletedFalse(String roleCode);
    List<User> findByRole_RoleCodeAndStatusAndIsDeletedFalse(String roleCode, String status);
    long countByRoleCategory_RoleCategoryIdAndIsDeletedFalse(Long roleCategoryId);
    long countByRole_RoleCodeAndIsDeletedFalse(String roleCode);
    long countByIsDeletedFalse();
    long countByStatusAndIsDeletedFalse(String status);
}
