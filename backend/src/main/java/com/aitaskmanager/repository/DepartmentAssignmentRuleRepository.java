package com.aitaskmanager.repository;

import com.aitaskmanager.model.entity.DepartmentAssignmentRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentAssignmentRuleRepository extends JpaRepository<DepartmentAssignmentRule, Long> {

    List<DepartmentAssignmentRule> findBySourceDepartmentIdAndActiveTrue(Long sourceDepartmentId);

    Optional<DepartmentAssignmentRule> findBySourceDepartmentIdAndTargetDepartmentId(Long sourceDeptId, Long targetDeptId);

    boolean existsBySourceDepartmentIdAndTargetDepartmentIdAndActiveTrue(Long sourceDeptId, Long targetDeptId);

    @Query("SELECT r FROM DepartmentAssignmentRule r " +
           "JOIN FETCH r.sourceDepartment " +
           "JOIN FETCH r.targetDepartment " +
           "WHERE r.active = true")
    List<DepartmentAssignmentRule> findAllActiveRules();
}
