package com.taskflow.worklog.repository;

import com.taskflow.worklog.entity.Worklog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;


@Repository
public interface WorklogRepository extends JpaRepository<Worklog, Long> {

    @Query("SELECT w FROM Worklog w WHERE w.user.userId = :userId AND w.isDeleted = false ORDER BY w.logDate DESC, w.createdAt DESC")
    List<Worklog> findByUserOrderByDate(@Param("userId") Long userId);

    @Query("SELECT w FROM Worklog w WHERE w.user.userId = :userId AND w.logDate BETWEEN :startDate AND :endDate AND w.isDeleted = false ORDER BY w.logDate DESC, w.createdAt DESC")
    List<Worklog> findByUserAndDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT w FROM Worklog w WHERE w.project.projectId = :projectId AND w.isDeleted = false ORDER BY w.logDate DESC, w.createdAt DESC")
    List<Worklog> findByProject(@Param("projectId") Long projectId);

    @Query("SELECT w FROM Worklog w WHERE w.project.projectId = :projectId AND w.status = :status AND w.isDeleted = false ORDER BY w.logDate DESC, w.createdAt DESC")
    List<Worklog> findByProjectAndStatus(@Param("projectId") Long projectId, @Param("status") String status);

    @Query("SELECT w FROM Worklog w WHERE w.isDeleted = false ORDER BY w.logDate DESC, w.createdAt DESC")
    List<Worklog> findAllActive();

    @Query("SELECT w FROM Worklog w WHERE w.logDate BETWEEN :startDate AND :endDate AND w.isDeleted = false ORDER BY w.logDate DESC, w.createdAt DESC")
    List<Worklog> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
}
