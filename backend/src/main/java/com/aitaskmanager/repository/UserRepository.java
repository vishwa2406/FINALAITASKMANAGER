package com.aitaskmanager.repository;

import com.aitaskmanager.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * ============================================================
 * REPOSITORY — Data Access for the User Model
 * ============================================================
 * Sits directly beneath the Model layer. Spring Data JPA
 * auto-implements this interface based on method names.
 * ============================================================
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /** SELECT * FROM users WHERE email = ? */
    Optional<User> findByEmail(String email);

    /** SELECT COUNT(*) > 0 FROM users WHERE email = ? */
    boolean existsByEmail(String email);

    /** SELECT * FROM users WHERE department_id = ? */
    java.util.List<User> findByDepartmentId(Long departmentId);

    /** SELECT * FROM users WHERE department_id = ? AND active = true */
    java.util.List<User> findByDepartmentIdAndActiveTrue(Long departmentId);

    org.springframework.data.domain.Page<User> findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String name, String email, org.springframework.data.domain.Pageable pageable);
}
