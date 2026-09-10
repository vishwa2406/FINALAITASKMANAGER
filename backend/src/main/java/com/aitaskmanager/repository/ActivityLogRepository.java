package com.aitaskmanager.repository;

import com.aitaskmanager.model.entity.ActivityLog;
import com.aitaskmanager.model.enums.ActivityCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {

    @Query("SELECT a FROM ActivityLog a WHERE " +
           "(:category IS NULL OR a.actionCategory = :category) AND " +
           "(:userEmail IS NULL OR LOWER(a.userEmail) LIKE LOWER(CONCAT('%', :userEmail, '%'))) AND " +
           "(:search IS NULL OR LOWER(a.action) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.details) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.userName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:startDate IS NULL OR a.createdAt >= :startDate) AND " +
           "(:endDate IS NULL OR a.createdAt <= :endDate)")
    Page<ActivityLog> findActivities(
            @Param("category") ActivityCategory category,
            @Param("userEmail") String userEmail,
            @Param("search") String search,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    long countByActionCategory(ActivityCategory category);

    long countByCreatedAtAfter(LocalDateTime since);

    @Query("SELECT a.actionCategory, COUNT(a) FROM ActivityLog a GROUP BY a.actionCategory")
    List<Object[]> countActivitiesByCategoryGroup();

    @Query("SELECT a.userEmail, a.userName, COUNT(a) as total FROM ActivityLog a WHERE a.userEmail IS NOT NULL GROUP BY a.userEmail, a.userName ORDER BY total DESC")
    List<Object[]> findTopActiveUsers(Pageable pageable);
}
