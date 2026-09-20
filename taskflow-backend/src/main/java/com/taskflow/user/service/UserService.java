package com.taskflow.user.service;

import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.role.entity.Role;
import com.taskflow.role.entity.RoleCategory;
import com.taskflow.role.repository.RoleCategoryRepository;
import com.taskflow.role.repository.RoleRepository;
import com.taskflow.user.dto.UserDto;
import com.taskflow.user.entity.User;
import com.taskflow.user.repository.UserRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RoleCategoryRepository roleCategoryRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       RoleCategoryRepository roleCategoryRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.roleCategoryRepository = roleCategoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UserDto.UserResponse createProjectManager(UserDto.CreateManagerRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("User with email '" + email + "' already exists");
        }

        Role pmRole = roleRepository.findByRoleCode("PROJECT_MANAGER")
                .orElseThrow(() -> new ResourceNotFoundException("Role PROJECT_MANAGER not found"));

        String rawPassword = (request.getTemporaryPassword() != null && !request.getTemporaryPassword().isBlank())
                ? request.getTemporaryPassword().trim()
                : "Manager@" + (100 + (int)(Math.random() * 900));

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(email)
                .phone(request.getPhone())
                .role(pmRole)
                .roleCategory(null)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .status("ACTIVE")
                .isFirstLogin(true)
                .isDeleted(false)
                .build();

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional
    public UserDto.UserResponse createTeamMember(UserDto.CreateTeamMemberRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("User with email '" + email + "' already exists");
        }

        Role memberRole = roleRepository.findByRoleCode("TEAM_MEMBER")
                .orElseThrow(() -> new ResourceNotFoundException("Role TEAM_MEMBER not found"));

        RoleCategory category = roleCategoryRepository.findById(request.getRoleCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Role category not found with id: " + request.getRoleCategoryId()));

        if (!"ACTIVE".equalsIgnoreCase(category.getStatus())) {
            throw new BadRequestException("Cannot assign inactive role category: " + category.getRoleCategoryName());
        }

        String rawPassword = (request.getTemporaryPassword() != null && !request.getTemporaryPassword().isBlank())
                ? request.getTemporaryPassword().trim()
                : "Member@" + (100 + (int)(Math.random() * 900));

        User user = User.builder()
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(email)
                .phone(request.getPhone())
                .role(memberRole)
                .roleCategory(category)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .status("ACTIVE")
                .isFirstLogin(true)
                .isDeleted(false)
                .build();

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public UserDto.UserPageResponse getUsers(String search, String roleCode, String status, int page, int size) {
        Specification<User> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (roleCode != null && !roleCode.isBlank() && !"ALL".equalsIgnoreCase(roleCode)) {
                predicates.add(cb.equal(root.get("role").get("roleCode"), roleCode.toUpperCase().trim()));
            }

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.toUpperCase().trim()));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.toLowerCase().trim() + "%";
                Predicate emailPredicate = cb.like(cb.lower(root.get("email")), searchPattern);
                Predicate firstNamePredicate = cb.like(cb.lower(root.get("firstName")), searchPattern);
                Predicate lastNamePredicate = cb.like(cb.lower(root.get("lastName")), searchPattern);
                predicates.add(cb.or(emailPredicate, firstNamePredicate, lastNamePredicate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage = userRepository.findAll(spec, pageRequest);

        List<UserDto.UserResponse> content = userPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new UserDto.UserPageResponse(
                content,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages(),
                userPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public UserDto.UserStatsResponse getUserStats() {
        long total = userRepository.countByIsDeletedFalse();
        long managers = userRepository.countByRole_RoleCodeAndIsDeletedFalse("PROJECT_MANAGER");
        long members = userRepository.countByRole_RoleCodeAndIsDeletedFalse("TEAM_MEMBER");
        long inactive = userRepository.countByStatusAndIsDeletedFalse("INACTIVE");

        return new UserDto.UserStatsResponse(total, managers, members, inactive);
    }

    @Transactional(readOnly = true)
    public UserDto.UserResponse getUserById(UUID id) {
        User user = userRepository.findById(id)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToResponse(user);
    }

    @Transactional
    public UserDto.UserResponse updateUser(UUID id, UserDto.UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhone(request.getPhone());

        if (request.getRoleCategoryId() != null) {
            RoleCategory category = roleCategoryRepository.findById(request.getRoleCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Role category not found with id: " + request.getRoleCategoryId()));
            user.setRoleCategory(category);
        }

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            user.setStatus(request.getStatus().toUpperCase().trim());
        }

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    @Transactional
    public UserDto.UserResponse toggleUserStatus(UUID id) {
        User user = userRepository.findById(id)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if ("ADMIN".equalsIgnoreCase(user.getRole().getRoleCode()) && "ACTIVE".equalsIgnoreCase(user.getStatus())) {
            long adminCount = userRepository.countByRole_RoleCodeAndIsDeletedFalse("ADMIN");
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot deactivate the primary administrator");
            }
        }

        user.setStatus("ACTIVE".equalsIgnoreCase(user.getStatus()) ? "INACTIVE" : "ACTIVE");
        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    @Transactional
    public String resetUserPassword(UUID id, UserDto.ResetPasswordAdminRequest request) {
        User user = userRepository.findById(id)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        String tempPassword = (request != null && request.getNewTemporaryPassword() != null && !request.getNewTemporaryPassword().isBlank())
                ? request.getNewTemporaryPassword().trim()
                : "Reset@" + (100 + (int)(Math.random() * 900));

        user.setPasswordHash(passwordEncoder.encode(tempPassword));
        user.setFirstLogin(true);
        userRepository.save(user);

        return tempPassword;
    }

    @Transactional
    public void softDeleteUser(UUID id) {
        User user = userRepository.findById(id)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if ("ADMIN".equalsIgnoreCase(user.getRole().getRoleCode())) {
            throw new BadRequestException("Administrators cannot be deleted");
        }

        user.setDeleted(true);
        user.setDeletedAt(Instant.now());
        user.setStatus("INACTIVE");
        userRepository.save(user);
    }

    public UserDto.UserResponse mapToResponse(User user) {
        return new UserDto.UserResponse(
                user.getUserId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getFirstName() + " " + user.getLastName(),
                user.getPhone(),
                user.getRole().getRoleCode(),
                user.getRoleCategory() != null ? user.getRoleCategory().getRoleCategoryId() : null,
                user.getRoleCategory() != null ? user.getRoleCategory().getRoleCategoryName() : null,
                user.getRoleCategory() != null ? user.getRoleCategory().getRoleCategoryCode() : null,
                user.getStatus(),
                user.isFirstLogin(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
