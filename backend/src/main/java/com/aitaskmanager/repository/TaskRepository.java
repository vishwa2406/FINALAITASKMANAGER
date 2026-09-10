package com.aitaskmanager.repository;

import com.aitaskmanager.model.entity.Task;
import com.aitaskmanager.model.enums.TaskPriority;
import com.aitaskmanager.model.enums.TaskStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * REPOSITORY — Data Access for the Task Model.
 * Supports multi-department task query, incoming/outgoing tasks,
 * status workflows, search, filtering, and dashboard analytics.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    /** Legacy compatibility: find tasks created by or assigned to user */
    @Query("SELECT t FROM Task t WHERE t.createdBy.id = :userId OR t.assignedToUser.id = :userId")
    Page<Task> findByUserId(@Param("userId") Long userId, Pageable pageable);

    /** Security check for direct task access */
    @Query("SELECT t FROM Task t WHERE t.id = :id AND " +
           "(t.createdBy.id = :userId OR t.assignedToUser.id = :userId OR " +
           "(t.assignedToDepartment IS NOT NULL AND t.assignedToDepartment.id = :departmentId) OR " +
           "(t.createdByDepartment IS NOT NULL AND t.createdByDepartment.id = :departmentId))")
    Optional<Task> findByIdAndUserOrDepartment(@Param("id") Long id,
                                               @Param("userId") Long userId,
                                               @Param("departmentId") Long departmentId);

    @Query("SELECT t FROM Task t WHERE t.id = :id AND (t.createdBy.id = :userId OR t.assignedToUser.id = :userId)")
    Optional<Task> findByIdAndUserId(@Param("id") Long id, @Param("userId") Long userId);

    // ────────────────────────────────────────────────────────────
    // INCOMING TASKS (Assigned to user or user's department)
    // ────────────────────────────────────────────────────────────
    @Query("SELECT t FROM Task t WHERE (t.assignedToUser.id = :userId OR " +
           "(t.assignedToDepartment IS NOT NULL AND t.assignedToDepartment.id = :deptId)) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:category IS NULL OR LOWER(t.category) = LOWER(:category)) " +
           "AND (:searchTerm IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Task> findIncomingTasks(@Param("userId") Long userId,
                                 @Param("deptId") Long deptId,
                                 @Param("status") TaskStatus status,
                                 @Param("priority") TaskPriority priority,
                                 @Param("category") String category,
                                 @Param("searchTerm") String searchTerm,
                                 Pageable pageable);

    // ────────────────────────────────────────────────────────────
    // OUTGOING TASKS (Created by user)
    // ────────────────────────────────────────────────────────────
    @Query("SELECT t FROM Task t WHERE t.createdBy.id = :userId " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:category IS NULL OR LOWER(t.category) = LOWER(:category)) " +
           "AND (:searchTerm IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Task> findOutgoingTasks(@Param("userId") Long userId,
                                 @Param("status") TaskStatus status,
                                 @Param("priority") TaskPriority priority,
                                 @Param("category") String category,
                                 @Param("searchTerm") String searchTerm,
                                 Pageable pageable);

    // ────────────────────────────────────────────────────────────
    // WAITING FOR REVIEW (Created by user and status is SUBMITTED_FOR_REVIEW)
    // ────────────────────────────────────────────────────────────
    @Query("SELECT t FROM Task t WHERE (t.createdBy.id = :userId OR (t.createdByDepartment IS NOT NULL AND t.createdByDepartment.id = :deptId)) AND t.status = 'SUBMITTED_FOR_REVIEW'")
    Page<Task> findTasksWaitingReview(@Param("userId") Long userId, @Param("deptId") Long deptId, Pageable pageable);

    // ────────────────────────────────────────────────────────────
    // DEPARTMENT TASKS (Created by or assigned to user's department)
    // ────────────────────────────────────────────────────────────
    @Query("SELECT t FROM Task t WHERE " +
           "(t.createdByDepartment.id = :deptId OR t.assignedToDepartment.id = :deptId) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:category IS NULL OR LOWER(t.category) = LOWER(:category)) " +
           "AND (:searchTerm IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Task> findDepartmentTasks(@Param("deptId") Long deptId,
                                   @Param("status") TaskStatus status,
                                   @Param("priority") TaskPriority priority,
                                   @Param("category") String category,
                                   @Param("searchTerm") String searchTerm,
                                   Pageable pageable);

    // ────────────────────────────────────────────────────────────
    // SEARCH & FILTER COMPATIBILITY
    // ────────────────────────────────────────────────────────────
    @Query("SELECT t FROM Task t WHERE (t.createdBy.id = :userId OR t.assignedToUser.id = :userId) AND " +
           "(LOWER(t.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(t.category) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    Page<Task> searchTasks(@Param("userId") Long userId,
                           @Param("searchTerm") String searchTerm,
                           Pageable pageable);

    @Query("SELECT t FROM Task t WHERE (t.createdBy.id = :userId OR t.assignedToUser.id = :userId) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:category IS NULL OR LOWER(t.category) = LOWER(:category)) " +
           "AND (:dueDateFrom IS NULL OR t.dueDate >= :dueDateFrom) " +
           "AND (:dueDateTo IS NULL OR t.dueDate <= :dueDateTo)")
    Page<Task> filterTasks(@Param("userId") Long userId,
                           @Param("status") TaskStatus status,
                           @Param("priority") TaskPriority priority,
                           @Param("category") String category,
                           @Param("dueDateFrom") LocalDate dueDateFrom,
                           @Param("dueDateTo") LocalDate dueDateTo,
                           Pageable pageable);

    // ────────────────────────────────────────────────────────────
    // STATS & COUNTS
    // ────────────────────────────────────────────────────────────
    @Query("SELECT COUNT(t) FROM Task t WHERE (t.createdBy.id = :userId OR t.assignedToUser.id = :userId)")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE (t.createdBy.id = :userId OR t.assignedToUser.id = :userId) AND t.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t WHERE (t.assignedToUser.id = :userId OR (t.assignedToDepartment IS NOT NULL AND t.assignedToDepartment.id = :deptId))")
    long countIncomingTasks(@Param("userId") Long userId, @Param("deptId") Long deptId);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.createdBy.id = :userId")
    long countOutgoingTasks(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM Task t WHERE (t.createdBy.id = :userId OR (t.createdByDepartment IS NOT NULL AND t.createdByDepartment.id = :deptId)) AND t.status = 'SUBMITTED_FOR_REVIEW'")
    long countWaitingReviewTasks(@Param("userId") Long userId, @Param("deptId") Long deptId);

    @Query("SELECT COUNT(t) FROM Task t WHERE (t.createdBy.id = :userId OR t.assignedToUser.id = :userId) " +
           "AND t.status != 'COMPLETED' AND t.status != 'CANCELLED' AND t.dueDate < :today")
    long countOverdueTasksForUser(@Param("userId") Long userId, @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE (t.createdBy.id = :userId OR t.assignedToUser.id = :userId) " +
           "AND t.status != 'COMPLETED' AND t.status != 'CANCELLED' " +
           "AND t.dueDate BETWEEN :today AND :endDate " +
           "ORDER BY t.dueDate ASC")
    List<Task> findTasksDueSoon(@Param("userId") Long userId,
                                @Param("today") LocalDate today,
                                @Param("endDate") LocalDate endDate);

    @Query("SELECT t FROM Task t WHERE (t.createdBy.id = :userId OR t.assignedToUser.id = :userId) " +
           "AND t.status NOT IN ('COMPLETED', 'CANCELLED') " +
           "AND t.dueDate < :today")
    List<Task> findOverdueTasks(@Param("userId") Long userId,
                                @Param("today") LocalDate today);

    @Query("SELECT t FROM Task t WHERE t.createdBy.id = :userId OR t.assignedToUser.id = :userId ORDER BY t.createdAt DESC")
    List<Task> findRecentTasksByUserId(@Param("userId") Long userId, Pageable pageable);
}
