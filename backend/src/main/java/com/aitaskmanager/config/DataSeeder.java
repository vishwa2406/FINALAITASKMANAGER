package com.aitaskmanager.config;

import com.aitaskmanager.model.entity.Department;
import com.aitaskmanager.model.entity.DepartmentAssignmentRule;
import com.aitaskmanager.model.entity.User;
import com.aitaskmanager.model.enums.Role;
import com.aitaskmanager.repository.DepartmentAssignmentRuleRepository;
import com.aitaskmanager.repository.DepartmentRepository;
import com.aitaskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Seeds initial departments, cross-department assignment rules,
 * default demo user accounts, and attaches departments to unassigned users.
 */
import com.aitaskmanager.model.enums.ActivityCategory;
import com.aitaskmanager.service.ActivityLogService;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final DepartmentRepository departmentRepository;
    private final DepartmentAssignmentRuleRepository ruleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Checking & seeding initial system data...");

        Map<String, Department> deptMap = seedDepartments();
        seedAssignmentRules(deptMap);
        seedDemoUsers(deptMap);
        migrateLegacyUsers(deptMap.get("IT"));
        seedSampleActivities();
    }

    private Map<String, Department> seedDepartments() {
        Map<String, String[]> defaults = new LinkedHashMap<>();
        defaults.put("HR", new String[]{"Human Resources", "Handles HR, payroll, employee relations, and recruitment."});
        defaults.put("FINANCE", new String[]{"Finance", "Handles financial reporting, budget, expense reimbursement, and accounting."});
        defaults.put("IT", new String[]{"Information Technology", "Handles software development, infrastructure, IT support, and hardware."});
        defaults.put("SALES", new String[]{"Sales", "Handles lead generation, sales operations, and client management."});
        defaults.put("MARKETING", new String[]{"Marketing", "Handles brand campaigns, public relations, and social media."});

        Map<String, Department> deptMap = new HashMap<>();

        for (Map.Entry<String, String[]> entry : defaults.entrySet()) {
            String code = entry.getKey();
            String name = entry.getValue()[0];
            String desc = entry.getValue()[1];

            Department dept = departmentRepository.findByCode(code)
                    .orElseGet(() -> departmentRepository.save(Department.builder()
                            .code(code)
                            .name(name)
                            .description(desc)
                            .active(true)
                            .build()));
            deptMap.put(code, dept);
        }
        return deptMap;
    }

    private void seedAssignmentRules(Map<String, Department> depts) {
        Map<String, List<String>> allowedMap = new HashMap<>();
        allowedMap.put("FINANCE", List.of("HR", "IT", "SALES"));
        allowedMap.put("HR", List.of("FINANCE", "IT", "SALES", "MARKETING"));
        allowedMap.put("IT", List.of("HR", "FINANCE", "SALES", "MARKETING"));
        allowedMap.put("SALES", List.of("IT", "FINANCE", "MARKETING"));
        allowedMap.put("MARKETING", List.of("SALES", "IT", "HR"));

        for (Map.Entry<String, List<String>> entry : allowedMap.entrySet()) {
            Department source = depts.get(entry.getKey());
            if (source == null) continue;

            for (String targetCode : entry.getValue()) {
                Department target = depts.get(targetCode);
                if (target == null) continue;

                if (!ruleRepository.existsBySourceDepartmentIdAndTargetDepartmentIdAndActiveTrue(source.getId(), target.getId())) {
                    ruleRepository.save(DepartmentAssignmentRule.builder()
                            .sourceDepartment(source)
                            .targetDepartment(target)
                            .active(true)
                            .build());
                    log.info("Seeded rule: {} -> {}", source.getCode(), target.getCode());
                }
            }
        }
    }

    private void seedDemoUsers(Map<String, Department> depts) {
        createDemoUserIfMissing("vishwa@finance.com", "Vishwa Modi", "Password123", Role.MANAGER, depts.get("FINANCE"));
        createDemoUserIfMissing("rahul@hr.com", "Rahul HR", "Password123", Role.USER, depts.get("HR"));
        createDemoUserIfMissing("admin@company.com", "System Admin", "Password123", Role.ADMIN, depts.get("IT"));
    }

    private void createDemoUserIfMissing(String email, String fullName, String rawPassword, Role role, Department dept) {
        if (!userRepository.existsByEmail(email)) {
            User user = User.builder()
                    .email(email)
                    .fullName(fullName)
                    .password(passwordEncoder.encode(rawPassword))
                    .role(role)
                    .department(dept)
                    .active(true)
                    .build();
            userRepository.save(user);
            log.info("Seeded demo user: {} (Role: {}, Dept: {})", email, role, dept != null ? dept.getCode() : "NONE");
        }
    }

    private void migrateLegacyUsers(Department defaultDept) {
        if (defaultDept == null) return;
        List<User> users = userRepository.findAll();
        for (User user : users) {
            if (user.getDepartment() == null) {
                user.setDepartment(defaultDept);
                userRepository.save(user);
                log.info("Assigned legacy user {} to default department {}", user.getEmail(), defaultDept.getCode());
            }
        }
    }

    private void seedSampleActivities() {
        userRepository.findByEmail("admin@company.com").ifPresent(admin -> {
            activityLogService.logActivity(admin, ActivityCategory.AUTH, "SYSTEM_INITIALIZED", "SYSTEM", 1L, "System booted up and initialized initial database schema & admin accounts");
            activityLogService.logActivity(admin, ActivityCategory.ADMIN, "DEPT_SEEDED", "DEPARTMENT", null, "Seeded default departments: IT, HR, FINANCE, SALES, MARKETING");
        });
        userRepository.findByEmail("vishwa@finance.com").ifPresent(user -> {
            activityLogService.logActivity(user, ActivityCategory.AUTH, "DEMO_LOGIN", "USER", user.getId(), "User Vishwa Modi logged in");
        });
    }
}
