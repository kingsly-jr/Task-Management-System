package com.taskflow.client.controller;

import com.taskflow.client.dto.ClientDto;
import com.taskflow.client.service.ClientService;
import com.taskflow.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import com.taskflow.security.UserPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clients")
@Tag(name = "Client Management", description = "Endpoints for managing client organizations and portal accounts")
public class ClientController {

    private final ClientService clientService;

    public ClientController(ClientService clientService) {
        this.clientService = clientService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create client organization and portal login account (Admin only)")
    public ResponseEntity<ApiResponse<ClientDto.ClientResponse>> createClient(
            @Valid @RequestBody ClientDto.CreateClientRequest request
    ) {
        ClientDto.ClientResponse response = clientService.createClient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Client created successfully with portal credentials", response));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "List client organizations with search and filtering")
    public ResponseEntity<ApiResponse<ClientDto.ClientPageResponse>> getClients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        ClientDto.ClientPageResponse response = clientService.getClients(search, status, page, size);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Get list of all active clients for dropdown selector")
    public ResponseEntity<ApiResponse<List<ClientDto.ClientResponse>>> getActiveClients() {
        List<ClientDto.ClientResponse> list = clientService.getAllActiveClients();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'PROJECT_MANAGER')")
    @Operation(summary = "Get client by ID")
    public ResponseEntity<ApiResponse<ClientDto.ClientResponse>> getClientById(@PathVariable Long id) {
        ClientDto.ClientResponse response = clientService.getClientById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update client details (Admin only)")
    public ResponseEntity<ApiResponse<ClientDto.ClientResponse>> updateClient(
            @PathVariable Long id,
            @Valid @RequestBody ClientDto.UpdateClientRequest request
    ) {
        ClientDto.ClientResponse response = clientService.updateClient(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Client updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle client active/inactive status (Admin only)")
    public ResponseEntity<ApiResponse<ClientDto.ClientResponse>> toggleClientStatus(@PathVariable Long id) {
        ClientDto.ClientResponse response = clientService.toggleClientStatus(id);
        return ResponseEntity.ok(ApiResponse.ok("Client status changed to " + response.getStatus(), response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Soft delete client (Admin only)")
    public ResponseEntity<ApiResponse<Void>> softDeleteClient(@PathVariable Long id) {
        clientService.softDeleteClient(id);
        return ResponseEntity.ok(ApiResponse.ok("Client deleted successfully", null));
    }

    @PostMapping(value = {"/{id}/provision-account", "/{id}/reset-password"})
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Provision or reset client portal login credentials with temporary password (Admin only)")
    public ResponseEntity<ApiResponse<ClientDto.ClientResponse>> provisionAccount(
            @PathVariable Long id,
            @Valid @RequestBody ClientDto.ProvisionAccountRequest request
    ) {
        ClientDto.ClientResponse response = clientService.provisionOrResetPortalAccount(id, request.getPassword());
        return ResponseEntity.ok(ApiResponse.ok("Client portal credentials provisioned successfully", response));
    }

    @GetMapping("/my-organization")
    @PreAuthorize("hasRole('CLIENT')")
    @Operation(summary = "Get current authenticated client organization profile")
    public ResponseEntity<ApiResponse<ClientDto.ClientResponse>> getMyOrganization(
            @AuthenticationPrincipal UserPrincipal principal
    ) {
        ClientDto.ClientResponse response = clientService.getMyOrganization(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
