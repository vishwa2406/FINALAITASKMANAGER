package com.aitaskmanager.model.entity;

import com.aitaskmanager.model.enums.ActivityCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ============================================================
 * MODEL LAYER — ActivityLog Entity
 * ============================================================
 * JPA Entity mapping the "activity_logs" table to audit and track
 * all user, task, admin, and AI actions across the task manager.
 * ============================================================
 */
@Entity
@Table(name = "activity_logs", indexes = {
    @Index(name = "idx_activity_user_email", columnList = "user_email"),
    @Index(name = "idx_activity_category", columnList = "action_category"),
    @Index(name = "idx_activity_created_at", columnList = "created_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "user_email", length = 150)
    private String userEmail;

    @Column(name = "user_name", length = 100)
    private String userName;

    @Column(nullable = false, length = 100)
    private String action;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_category", nullable = false, length = 30)
    private ActivityCategory actionCategory;

    @Column(name = "entity_type", length = 50)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
