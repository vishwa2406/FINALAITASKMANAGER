package com.aitaskmanager.model.entity;

import com.aitaskmanager.model.enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * ============================================================
 * MODEL LAYER — User Entity
 * ============================================================
 * This class IS the data model. @Entity tells Hibernate/JPA
 * to map this Java object to a MySQL table ("users").
 *
 * The Model layer's job:
 *  - Define the shape of persistent data
 *  - Define relationships (User → many Tasks)
 *  - Stay completely ignorant of HTTP, JSON, or Controllers
 *
 * It is NEVER returned directly to the client — the Service
 * layer converts it into a View DTO (UserResponse) before
 * sending it out. This keeps internal fields like `password`
 * from ever leaking into an HTTP response.
 * ============================================================
 */
@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(columnNames = "email")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    /** BCrypt hash — never expose this in a View DTO! */
    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Role role = Role.USER;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "department_id")
    private Department department;

    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    /** One User has many Tasks */
    @OneToMany(mappedBy = "assignedToUser", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<Task> tasks = new ArrayList<>();
}
