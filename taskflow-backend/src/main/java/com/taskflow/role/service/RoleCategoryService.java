package com.taskflow.role.service;

import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.role.dto.RoleCategoryDto;
import com.taskflow.role.entity.RoleCategory;
import com.taskflow.role.repository.RoleCategoryRepository;
import com.taskflow.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleCategoryService {

    private final RoleCategoryRepository roleCategoryRepository;
    private final UserRepository userRepository;

    public RoleCategoryService(RoleCategoryRepository roleCategoryRepository, UserRepository userRepository) {
        this.roleCategoryRepository = roleCategoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public RoleCategoryDto.Response createCategory(RoleCategoryDto.CreateRequest request) {
        String code = request.getRoleCategoryCode().toUpperCase().trim();
        if (roleCategoryRepository.existsByRoleCategoryCode(code)) {
            throw new BadRequestException("Role category with code '" + code + "' already exists");
        }

        RoleCategory category = RoleCategory.builder()
                .roleCategoryName(request.getRoleCategoryName().trim())
                .roleCategoryCode(code)
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus().toUpperCase() : "ACTIVE")
                .build();

        RoleCategory saved = roleCategoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<RoleCategoryDto.Response> getAllCategories(String status) {
        List<RoleCategory> list;
        if (status != null && !status.isBlank()) {
            list = roleCategoryRepository.findByStatus(status.toUpperCase().trim());
        } else {
            list = roleCategoryRepository.findAll();
        }

        return list.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleCategoryDto.Response getCategoryById(Long id) {
        RoleCategory category = roleCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role category not found with id: " + id));
        return mapToResponse(category);
    }

    @Transactional
    public RoleCategoryDto.Response updateCategory(Long id, RoleCategoryDto.UpdateRequest request) {
        RoleCategory category = roleCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role category not found with id: " + id));

        category.setRoleCategoryName(request.getRoleCategoryName().trim());
        category.setDescription(request.getDescription());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            category.setStatus(request.getStatus().toUpperCase().trim());
        }

        RoleCategory updated = roleCategoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Transactional
    public RoleCategoryDto.Response toggleCategoryStatus(Long id) {
        RoleCategory category = roleCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role category not found with id: " + id));

        boolean willDeactivate = "ACTIVE".equalsIgnoreCase(category.getStatus());
        if (willDeactivate) {
            long assignedUsers = userRepository.countByRoleCategory_RoleCategoryIdAndIsDeletedFalse(id);
            if (assignedUsers > 0) {
                throw new BadRequestException("Cannot deactivate category: It is currently assigned to " + assignedUsers + " active employee(s). Reassign them first.");
            }
            category.setStatus("INACTIVE");
        } else {
            category.setStatus("ACTIVE");
        }

        RoleCategory saved = roleCategoryRepository.save(category);
        return mapToResponse(saved);
    }

    public RoleCategoryDto.Response mapToResponse(RoleCategory category) {
        long count = userRepository.countByRoleCategory_RoleCategoryIdAndIsDeletedFalse(category.getRoleCategoryId());
        return new RoleCategoryDto.Response(
                category.getRoleCategoryId(),
                category.getRoleCategoryName(),
                category.getRoleCategoryCode(),
                category.getDescription(),
                category.getStatus(),
                count,
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}
