package com.aitaskmanager.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * ============================================================
 * MODEL LAYER — DepartmentAssignmentRule Entity
 * ============================================================
 * Defines which target department a source department is
 * allowed to assign tasks to.
 * ============================================================
 */
@Entity
@Table(name = "department_assignment_rules", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"source_department_id", "target_department_id"})
}, indexes = {
    @Index(name = "idx_rule_source", columnList = "source_department_id"),
    @Index(name = "idx_rule_target", columnList = "target_department_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentAssignmentRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "source_department_id", nullable = false)
    private Department sourceDepartment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_department_id", nullable = false)
    private Department targetDepartment;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
