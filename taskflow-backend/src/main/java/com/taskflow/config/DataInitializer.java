package com.taskflow.config;

import com.taskflow.client.entity.Client;
import com.taskflow.client.repository.ClientRepository;
import com.taskflow.project.entity.Project;
import com.taskflow.project.entity.ProjectMember;
import com.taskflow.project.repository.ProjectMemberRepository;
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

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final RoleRepository roleRepository;
    private final RoleCategoryRepository roleCategoryRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProjectRepository projectRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
                           RoleCategoryRepository roleCategoryRepository,
                           UserRepository userRepository,
                           ClientRepository clientRepository,
                           ProjectRepository projectRepository,
                           ProjectMemberRepository projectMemberRepository,
                           PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.roleCategoryRepository = roleCategoryRepository;
        this.userRepository = userRepository;
        this.clientRepository = clientRepository;
        this.projectRepository = projectRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Starting TaskFlow Database Seed & Role Initialization...");

        // 1. Initialize System Roles
        Role adminRole = getOrCreateRole("ADMIN", "ADMIN", "Administrator with full company-wide management permissions");
        Role managerRole = getOrCreateRole("PROJECT_MANAGER", "PROJECT_MANAGER", "Project Manager managing projects, teams, milestones and tasks");
        Role memberRole = getOrCreateRole("TEAM_MEMBER", "TEAM_MEMBER", "Team member executing tasks, reporting progress, and logging time");
        Role clientRole = getOrCreateRole("CLIENT", "CLIENT", "Client viewing assigned projects, progress, milestones, and submitting change requests");

        // 2. Initialize Dynamic Role Categories
        RoleCategory fullStack = getOrCreateCategory("Full Stack Developer", "FULL_STACK_DEVELOPER", "Develops frontend and backend systems");
        RoleCategory uiUx = getOrCreateCategory("UI/UX Designer", "UI_UX_DESIGNER", "Designs UI/UX prototypes, components, and workflows");
        RoleCategory qaTester = getOrCreateCategory("QA Tester", "QA_TESTER", "Tests software, identifies bugs, and validates releases");
        getOrCreateCategory("Frontend Developer", "FRONTEND_DEVELOPER", "Specializes in React and modern web frontends");
        getOrCreateCategory("Backend Developer", "BACKEND_DEVELOPER", "Builds robust APIs, microservices, and databases");
        getOrCreateCategory("DevOps Engineer", "DEVOPS_ENGINEER", "Manages CI/CD pipelines, cloud, and infrastructure");
        getOrCreateCategory("Digital Marketing", "DIGITAL_MARKETING", "Coordinates online campaigns and product growth");

        // 3. Initialize Demo Users
        getOrCreateUser("admin@taskflow.com", "admin123", "System", "Admin", adminRole, null, "+1-555-0100", false);
        getOrCreateUser("manager@taskflow.com", "manager123", "Sarah", "Jenkins", managerRole, null, "+1-555-0101", false);
        getOrCreateUser("developer@taskflow.com", "dev123", "Alex", "Rivera", memberRole, fullStack, "+1-555-0102", false);
        getOrCreateUser("designer@taskflow.com", "designer123", "Elena", "Vance", memberRole, uiUx, "+1-555-0103", false);
        getOrCreateUser("tester@taskflow.com", "qa123", "David", "Kim", memberRole, qaTester, "+1-555-0104", false);
        getOrCreateUser("client@taskflow.com", "client123", "Marcus", "Sterling", clientRole, null, "+1-555-0105", false);

        // 4. Seed Demo Client Record & Project Contract
        User clientUser = userRepository.findByEmailIgnoreCase("client@taskflow.com").orElse(null);
        if (clientUser != null) {
            Client client = clientRepository.findByEmailIgnoreCaseAndIsDeletedFalse("client@taskflow.com").orElseGet(() -> {
                Client newClient = Client.builder()
                        .user(clientUser)
                        .companyName("Acme Global Technologies")
                        .contactPerson("Marcus Sterling")
                        .email("client@taskflow.com")
                        .phone("+1-555-0105")
                        .address("100 Innovation Way, Suite 400")
                        .country("United States")
                        .status("ACTIVE")
                        .isDeleted(false)
                        .build();
                return clientRepository.save(newClient);
            });

            // Ensure client has user link
            if (client.getUser() == null) {
                client.setUser(clientUser);
                client = clientRepository.save(client);
            }

            User pmUser = userRepository.findByEmailIgnoreCase("manager@taskflow.com").orElse(null);
            if (pmUser != null && !projectRepository.existsByProjectCodeIgnoreCaseAndIsDeletedFalse("PRJ-0001")) {
                Project demoProject = Project.builder()
                        .projectCode("PRJ-0001")
                        .projectName("Enterprise Cloud Platform & API Gateway")
                        .description("Scalable multi-tenant microservices architecture with real-time analytics, automated CI/CD, and client-facing portal.")
                        .client(client)
                        .projectManager(pmUser)
                        .startDate(LocalDate.now().minusDays(10))
                        .expectedEndDate(LocalDate.now().plusDays(60))
                        .budget(new BigDecimal("125000.00"))
                        .priority("HIGH")
                        .status("IN_PROGRESS")
                        .progress(0)
                        .technologyStack("Java 25, Spring Boot, React, PostgreSQL")
                        .isDeleted(false)
                        .build();
                Project savedProject = projectRepository.save(demoProject);

                User devUser = userRepository.findByEmailIgnoreCase("developer@taskflow.com").orElse(null);
                if (devUser != null) {
                    ProjectMember member = ProjectMember.builder()
                            .project(savedProject)
                            .user(devUser)
                            .roleCategory(devUser.getRoleCategory())
                            .status("ACTIVE")
                            .build();
                    projectMemberRepository.save(member);
                }
                User qaUser = userRepository.findByEmailIgnoreCase("tester@taskflow.com").orElse(null);
                if (qaUser != null) {
                    ProjectMember member = ProjectMember.builder()
                            .project(savedProject)
                            .user(qaUser)
                            .roleCategory(qaUser.getRoleCategory())
                            .status("ACTIVE")
                            .build();
                    projectMemberRepository.save(member);
                }
                log.info("Seeded Demo Contract Project PRJ-0001 for Client: {}", client.getCompanyName());
            }
        }

        log.info("TaskFlow Database Seed Completed successfully!");
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

    private void getOrCreateUser(String email, String plainPassword, String firstName, String lastName,
                                 Role role, RoleCategory category, String phone, boolean isFirstLogin) {
        if (!userRepository.existsByEmailIgnoreCase(email)) {
            User user = User.builder()
                    .email(email.toLowerCase().trim())
                    .passwordHash(passwordEncoder.encode(plainPassword))
                    .firstName(firstName)
                    .lastName(lastName)
                    .role(role)
                    .roleCategory(category)
                    .phone(phone)
                    .status("ACTIVE")
                    .isFirstLogin(isFirstLogin)
                    .isDeleted(false)
                    .build();
            userRepository.save(user);
            log.info("Created Demo User: {} with role: {}", email, role.getRoleCode());
        }
    }
}
