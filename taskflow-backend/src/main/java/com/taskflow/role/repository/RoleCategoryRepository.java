package com.taskflow.role.repository;

import com.taskflow.role.entity.RoleCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleCategoryRepository extends JpaRepository<RoleCategory, Long> {
    Optional<RoleCategory> findByRoleCategoryCode(String roleCategoryCode);
    boolean existsByRoleCategoryCode(String roleCategoryCode);
    List<RoleCategory> findByStatus(String status);
}
