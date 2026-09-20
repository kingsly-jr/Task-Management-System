package com.taskflow.config;

import com.taskflow.audit.repository.AuditLogRepository;
import com.taskflow.audit.service.AuditLogService;
import com.taskflow.role.entity.Role;
import com.taskflow.role.entity.RoleCategory;
import com.taskflow.role.repository.RoleCategoryRepository;
import com.taskflow.role.repository.RoleRepository;
import com.taskflow.user.entity.User;
import com.taskflow.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final RoleCategoryRepository roleCategoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;

    public DataInitializer(RoleRepository roleRepository,
                           RoleCategoryRepository roleCategoryRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuditLogRepository auditLogRepository,
                           AuditLogService auditLogService) {
        this.roleRepository = roleRepository;
        this.roleCategoryRepository = roleCategoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
        this.auditLogService = auditLogService;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting TaskFlow Seed: Roles, Categories, and Admin...");

        // 1. System Roles
        Role adminRole = getOrCreateRole("ADMIN", "ADMIN", "Administrator with full company-wide management permissions");
        getOrCreateRole("PROJECT_MANAGER", "PROJECT_MANAGER", "Project Manager managing projects, teams, milestones and tasks");
        getOrCreateRole("TEAM_MEMBER", "TEAM_MEMBER", "Team member executing tasks, reporting progress, and logging time");
        getOrCreateRole("CLIENT", "CLIENT", "Client viewing assigned projects, progress, milestones, and submitting change requests");

        // 2. Role Categories
        getOrCreateCategory("Full Stack Developer", "FULL_STACK_DEVELOPER", "Develops frontend and backend systems");
        getOrCreateCategory("UI/UX Designer", "UI_UX_DESIGNER", "Designs UI/UX prototypes, components, and workflows");
        getOrCreateCategory("QA Tester", "QA_TESTER", "Tests software, identifies bugs, and validates releases");
        getOrCreateCategory("Frontend Developer", "FRONTEND_DEVELOPER", "Specializes in React and modern web frontends");
        getOrCreateCategory("Backend Developer", "BACKEND_DEVELOPER", "Builds robust APIs, microservices, and databases");
        getOrCreateCategory("DevOps Engineer", "DEVOPS_ENGINEER", "Manages CI/CD pipelines, cloud, and infrastructure");
        getOrCreateCategory("Digital Marketing", "DIGITAL_MARKETING", "Coordinates online campaigns and product growth");

        // 3. Admin User (ID=1) — only default account seeded
        if (!userRepository.existsByEmailIgnoreCase("admin@taskflow.com")) {
            User admin = User.builder()
                    .email("admin@taskflow.com")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .firstName("System")
                    .lastName("Admin")
                    .role(adminRole)
                    .roleCategory(null)
                    .phone("+1-555-0100")
                    .status("ACTIVE")
                    .isFirstLogin(false)
                    .isDeleted(false)
                    .build();
            userRepository.save(admin);
            log.info("Created Admin User: admin@taskflow.com (ID will be 1)");
        }

        // 4. Initial Audit Logs
        if (auditLogRepository.count() == 0) {
            auditLogService.log(
                    "system@taskflow.internal", "SYSTEM", "SYSTEM", "INITIALIZE",
                    "DatabaseSchema", "1", "PostgreSQL database schema initialized with identity sequences",
                    "127.0.0.1", "SUCCESS", "{\"engine\":\"PostgreSQL 18\",\"framework\":\"Spring Boot 3.4\"}"
            );

            auditLogService.log(
                    "system@taskflow.internal", "SYSTEM", "ROLE_MGMT", "PROVISION",
                    "SystemRoles", "4", "Default RBAC security roles provisioned: ADMIN, PROJECT_MANAGER, TEAM_MEMBER, CLIENT",
                    "127.0.0.1", "SUCCESS", null
            );

            auditLogService.log(
                    "system@taskflow.internal", "SYSTEM", "USER_MGMT", "CREATE",
                    "User", "1", "Super Administrator root account created for admin@taskflow.com",
                    "127.0.0.1", "SUCCESS", "{\"userId\":1,\"email\":\"admin@taskflow.com\"}"
            );

            auditLogService.log(
                    "admin@taskflow.com", "ADMIN", "AUTH", "LOGIN",
                    "Session", "1", "Super Administrator session authenticated via Web UI",
                    "127.0.0.1", "SUCCESS", "{\"client\":\"Chrome / Windows 11\"}"
            );

            auditLogService.log(
                    "admin@taskflow.com", "ADMIN", "SECURITY", "POLICY_CHECK",
                    "SecurityContext", "1", "RBAC security context and JWT token validation verified",
                    "127.0.0.1", "SUCCESS", "{\"algorithm\":\"HS256\",\"duration\":\"24h\"}"
            );
            log.info("Seeded initial audit governance logs");
        }

        log.info("TaskFlow Seed Completed. Login: admin@taskflow.com / admin123");
    }

    private Role getOrCreateRole(String roleName, String roleCode, String description) {
        return roleRepository.findByRoleCode(roleCode).orElseGet(() -> {
            Role role = Role.builder()
                    .roleName(roleName)
                    .roleCode(roleCode)
                    .description(description)
                    .build();
            return roleRepository.save(role);
        });
    }

    private RoleCategory getOrCreateCategory(String name, String code, String description) {
        return roleCategoryRepository.findByRoleCategoryCode(code).orElseGet(() -> {
            RoleCategory category = RoleCategory.builder()
                    .roleCategoryName(name)
                    .roleCategoryCode(code)
                    .description(description)
                    .status("ACTIVE")
                    .build();
            return roleCategoryRepository.save(category);
        });
    }
}
