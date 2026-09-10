package com.aitaskmanager.model.entity;

import com.aitaskmanager.model.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * ============================================================
 * MODEL LAYER — TaskHistory Entity
 * ============================================================
 * Tracks the complete audit trail and status transition history
 * of a task.
 * ============================================================
 */
@Entity
@Table(name = "task_history", indexes = {
    @Index(name = "idx_history_task_id", columnList = "task_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", nullable = false)
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_user_id", nullable = false)
    private User performedBy;

    @Column(nullable = false, length = 100)
    private String action;

    @Enumerated(EnumType.STRING)
    @Column(length = 25)
    private TaskStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(length = 25)
    private TaskStatus newStatus;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
