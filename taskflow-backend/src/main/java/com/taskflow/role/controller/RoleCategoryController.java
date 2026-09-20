package com.taskflow.role.controller;

import com.taskflow.common.response.ApiResponse;
import com.taskflow.role.dto.RoleCategoryDto;
import com.taskflow.role.service.RoleCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/role-categories")
@Tag(name = "Role Categories", description = "Dynamic employee professional categories/skills management")
public class RoleCategoryController {

    private final RoleCategoryService roleCategoryService;

    public RoleCategoryController(RoleCategoryService roleCategoryService) {
        this.roleCategoryService = roleCategoryService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create role category (Admin only)")
    public ResponseEntity<ApiResponse<RoleCategoryDto.Response>> createCategory(
            @Valid @RequestBody RoleCategoryDto.CreateRequest request
    ) {
        RoleCategoryDto.Response response = roleCategoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Role category created successfully", response));
    }

    @GetMapping
    @Operation(summary = "Get all role categories")
    public ResponseEntity<ApiResponse<List<RoleCategoryDto.Response>>> getAllCategories(
            @RequestParam(required = false) String status
    ) {
        List<RoleCategoryDto.Response> list = roleCategoryService.getAllCategories(status);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get role category by ID")
    public ResponseEntity<ApiResponse<RoleCategoryDto.Response>> getCategoryById(@PathVariable Long id) {
        RoleCategoryDto.Response response = roleCategoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update role category (Admin only)")
    public ResponseEntity<ApiResponse<RoleCategoryDto.Response>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody RoleCategoryDto.UpdateRequest request
    ) {
        RoleCategoryDto.Response response = roleCategoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Role category updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle role category active/inactive status (Admin only)")
    public ResponseEntity<ApiResponse<RoleCategoryDto.Response>> toggleCategoryStatus(@PathVariable Long id) {
        RoleCategoryDto.Response response = roleCategoryService.toggleCategoryStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("Role category status updated to " + response.getStatus(), response));
    }
}
