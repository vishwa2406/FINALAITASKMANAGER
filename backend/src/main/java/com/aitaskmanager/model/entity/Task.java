package com.aitaskmanager.model.entity;

import com.aitaskmanager.model.enums.TaskPriority;
import com.aitaskmanager.model.enums.TaskStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ============================================================
 * MODEL LAYER — Task Entity
 * ============================================================
 * Maps to the "tasks" table. Many Tasks belong to one User
 * (@ManyToOne). Indexes are declared here because they are
 * a property of the data model / storage, not of the API.
 * ============================================================
 */
@Entity
@Table(name = "tasks", indexes = {
    @Index(name = "idx_task_created_by", columnList = "created_by_user_id"),
    @Index(name = "idx_task_assigned_user", columnList = "assigned_to_user_id"),
    @Index(name = "idx_task_assigned_dept", columnList = "assigned_to_department_id"),
    @Index(name = "idx_task_status", columnList = "status"),
    @Index(name = "idx_task_priority", columnList = "priority"),
    @Index(name = "idx_task_due_date", columnList = "dueDate")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Task {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    @Builder.Default
    private TaskStatus status = TaskStatus.TODO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(length = 100)
    private String category;

    @Column
    private LocalDate dueDate;

    @Column
    private Double estimatedHours;

    @Column
    private Double actualHours;

    @Column(length = 500)
    private String tags;

    /** Populated by AiService after calling OpenAI */
    @Column(columnDefinition = "TEXT")
    private String aiSuggestion;

    @Column
    @Builder.Default
    private Boolean aiAnalyzed = false;

    /** User who created/assigned the task */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdBy;

    /** Department of the creator */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_department_id")
    private Department createdByDepartment;

    /** Target department assigned to perform the task */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_department_id")
    private Department assignedToDepartment;

    /** Specific user assigned to perform the task */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_user_id")
    private User assignedToUser;

    @Column
    private LocalDateTime assignedAt;

    @Column
    private LocalDateTime completedAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /** Backward-compatibility alias for legacy user getter */
    public User getUser() {
        return assignedToUser != null ? assignedToUser : createdBy;
    }

    /** Backward-compatibility alias for legacy user setter */
    public void setUser(User user) {
        this.createdBy = user;
        this.assignedToUser = user;
    }
}
