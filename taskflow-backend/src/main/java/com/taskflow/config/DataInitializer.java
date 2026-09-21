package com.taskflow.config;

import com.taskflow.audit.repository.AuditLogRepository;
import com.taskflow.audit.service.AuditLogService;
import com.taskflow.client.entity.Client;
import com.taskflow.client.repository.ClientRepository;
import com.taskflow.project.entity.Project;
import com.taskflow.project.repository.ProjectRepository;
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

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final RoleCategoryRepository roleCategoryRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;
    private final AuditLogService auditLogService;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;

    public DataInitializer(RoleRepository roleRepository,
                           RoleCategoryRepository roleCategoryRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           AuditLogRepository auditLogRepository,
                           AuditLogService auditLogService,
                           ClientRepository clientRepository,
                           ProjectRepository projectRepository) {
        this.roleRepository = roleRepository;
        this.roleCategoryRepository = roleCategoryRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
        this.auditLogService = auditLogService;
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting TaskFlow Seed: Roles, Categories, Users, and Financial Projects...");

        // 1. System Roles
        Role adminRole = getOrCreateRole("ADMIN", "ADMIN", "Administrator with full company-wide management permissions");
        Role pmRole = getOrCreateRole("PROJECT_MANAGER", "PROJECT_MANAGER", "Project Manager managing projects, teams, milestones and tasks");
        Role memberRole = getOrCreateRole("TEAM_MEMBER", "TEAM_MEMBER", "Team member executing tasks, reporting progress, and logging time");
        Role clientRole = getOrCreateRole("CLIENT", "CLIENT", "Client viewing assigned projects, progress, milestones, and submitting change requests");

        // 2. Role Categories
        getOrCreateCategory("Full Stack Developer", "FULL_STACK_DEVELOPER", "Develops frontend and backend systems");
        getOrCreateCategory("UI/UX Designer", "UI_UX_DESIGNER", "Designs UI/UX prototypes, components, and workflows");
        getOrCreateCategory("QA Tester", "QA_TESTER", "Tests software, identifies bugs, and validates releases");
        getOrCreateCategory("Frontend Developer", "FRONTEND_DEVELOPER", "Specializes in React and modern web frontends");
        getOrCreateCategory("Backend Developer", "BACKEND_DEVELOPER", "Builds robust APIs, microservices, and databases");
        getOrCreateCategory("DevOps Engineer", "DEVOPS_ENGINEER", "Manages CI/CD pipelines, cloud, and infrastructure");
        getOrCreateCategory("Digital Marketing", "DIGITAL_MARKETING", "Coordinates online campaigns and product growth");

        // 3. Guaranteed Users
        upsertUser("admin@taskflow.com", "admin123", "System", "Admin", adminRole, null, "+1-555-0100");
        User pm = upsertUser("manager@taskflow.com", "manager123", "Alex", "Morgan", pmRole, null, "+1-555-0101");
        upsertUser("member@taskflow.com", "member123", "Jordan", "Lee", memberRole, null, "+1-555-0102");
        User clientUser = upsertUser("client@acme.com", "client123", "Sarah", "Connor", clientRole, null, "+1-555-0103");

        // 4. Guaranteed Client Entity
        Client client = clientRepository.findByEmailIgnoreCaseAndIsDeletedFalse("client@acme.com").orElse(null);
        if (client == null) {
            client = new Client();
            client.setCompanyName("Acme Corporation");
            client.setContactPerson("Sarah Connor");
            client.setEmail("client@acme.com");
            client.setPhone("+1-555-0103");
            client.setAddress("100 Enterprise Blvd, Tech District");
            client.setCountry("United States");
            client.setStatus("ACTIVE");
            client.setDeleted(false);
            client.setUser(clientUser);
            client = clientRepository.save(client);
            log.info("Created Client entity: Acme Corporation");
        } else {
            if (client.getUser() == null) {
                client.setUser(clientUser);
                client = clientRepository.save(client);
            }
        }

        // 5. Ensure Projects have budget, paid, remaining
        List<Project> existingProjects = projectRepository.findByIsDeletedFalse();
        if (existingProjects.isEmpty()) {
            Project demoProject = Project.builder()
                    .projectCode("PRJ-0001")
                    .projectName("Acme ERP Modernization")
                    .description("Enterprise resource planning software modern architecture migration and real-time ledger overhaul.")
                    .client(client)
                    .projectManager(pm)
                    .startDate(LocalDate.now().minusMonths(1))
                    .expectedEndDate(LocalDate.now().plusMonths(3))
                    .budget(new BigDecimal("75000.00"))
                    .paidAmount(new BigDecimal("30000.00"))
                    .remainingAmount(new BigDecimal("45000.00"))
                    .status("IN_PROGRESS")
                    .priority("HIGH")
                    .progress(40)
                    .isDeleted(false)
                    .build();
            projectRepository.save(demoProject);
            log.info("Created Seed Project: PRJ-0001 - Acme ERP Modernization (Budget: $75,000, Paid: $30,000, Remaining: $45,000)");
        } else {
            for (Project p : existingProjects) {
                boolean changed = false;
                if (p.getBudget() == null) {
                    p.setBudget(new BigDecimal("75000.00"));
                    changed = true;
                }
                if (p.getPaidAmount() == null) {
                    p.setPaidAmount(new BigDecimal("30000.00"));
                    changed = true;
                }
                if (p.getRemainingAmount() == null) {
                    p.setRemainingAmount(p.getBudget().subtract(p.getPaidAmount()));
                    changed = true;
                }
                if (changed) {
                    projectRepository.save(p);
                    log.info("Updated Project {}: Budget={}, Paid={}, Remaining={}", p.getProjectCode(), p.getBudget(), p.getPaidAmount(), p.getRemainingAmount());
                }
            }
        }

        // 6. Initial Audit Logs
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
            log.info("Seeded initial audit governance logs");
        }

        log.info("TaskFlow Seed Completed. Demo Accounts: admin@taskflow.com/admin123, manager@taskflow.com/manager123, member@taskflow.com/member123, client@acme.com/client123");
    }

    private User upsertUser(String email, String rawPassword, String firstName, String lastName, Role role, RoleCategory category, String phone) {
        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null) {
            user = User.builder()
                    .email(email)
                    .passwordHash(passwordEncoder.encode(rawPassword))
                    .firstName(firstName)
                    .lastName(lastName)
                    .role(role)
                    .roleCategory(category)
                    .phone(phone)
                    .status("ACTIVE")
                    .isFirstLogin(false)
                    .isDeleted(false)
                    .build();
            user = userRepository.save(user);
            log.info("Created Seed User: {} / {}", email, rawPassword);
        } else {
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(role);
            user.setStatus("ACTIVE");
            user.setDeleted(false);
            user.setFirstLogin(false);
            user = userRepository.save(user);
            log.info("Updated Seed User: {} password and active status verified", email);
        }
        return user;
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
