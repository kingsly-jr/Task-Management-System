package com.taskflow.client.service;

import com.taskflow.client.dto.ClientDto;
import com.taskflow.client.entity.Client;
import com.taskflow.client.repository.ClientRepository;
import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.project.repository.ProjectRepository;
import com.taskflow.role.entity.Role;
import com.taskflow.role.repository.RoleRepository;
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
import java.util.stream.Collectors;

@Service
public class ClientService {

    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;

    public ClientService(ClientRepository clientRepository,
                         UserRepository userRepository,
                         RoleRepository roleRepository,
                         ProjectRepository projectRepository,
                         PasswordEncoder passwordEncoder) {
        this.clientRepository = clientRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.projectRepository = projectRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public ClientDto.ClientResponse createClient(ClientDto.CreateClientRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (clientRepository.existsByEmailIgnoreCaseAndIsDeletedFalse(email) || userRepository.existsByEmailIgnoreCase(email)) {
            throw new BadRequestException("An account with email '" + email + "' already exists");
        }

        Role clientRole = roleRepository.findByRoleCode("CLIENT")
                .orElseThrow(() -> new ResourceNotFoundException("Role CLIENT not found"));

        String rawPassword = (request.getTemporaryPassword() != null && !request.getTemporaryPassword().isBlank())
                ? request.getTemporaryPassword().trim()
                : "Client@" + (100 + (int)(Math.random() * 900));

        // Split contact person into first and last name
        String[] nameParts = request.getContactPerson().trim().split("\\s+", 2);
        String firstName = nameParts[0];
        String lastName = nameParts.length > 1 ? nameParts[1] : "";

        // 1. Create User account for Client Portal Login
        User clientUser = User.builder()
                .firstName(firstName)
                .lastName(lastName)
                .email(email)
                .phone(request.getPhone())
                .role(clientRole)
                .passwordHash(passwordEncoder.encode(rawPassword))
                .status("ACTIVE")
                .isFirstLogin(true)
                .isDeleted(false)
                .build();

        User savedUser = userRepository.save(clientUser);

        // 2. Create Client Record
        Client client = Client.builder()
                .user(savedUser)
                .companyName(request.getCompanyName().trim())
                .contactPerson(request.getContactPerson().trim())
                .email(email)
                .phone(request.getPhone())
                .address(request.getAddress())
                .country(request.getCountry())
                .status("ACTIVE")
                .isDeleted(false)
                .build();

        Client savedClient = clientRepository.save(client);

        ClientDto.ClientResponse response = mapToResponse(savedClient);
        response.setTemporaryPassword(rawPassword);
        return response;
    }

    @Transactional(readOnly = true)
    public ClientDto.ClientPageResponse getClients(String search, String status, int page, int size) {
        Specification<Client> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.isFalse(root.get("isDeleted")));

            if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status.toUpperCase().trim()));
            }

            if (search != null && !search.isBlank()) {
                String searchPattern = "%" + search.toLowerCase().trim() + "%";
                Predicate company = cb.like(cb.lower(root.get("companyName")), searchPattern);
                Predicate contact = cb.like(cb.lower(root.get("contactPerson")), searchPattern);
                Predicate email = cb.like(cb.lower(root.get("email")), searchPattern);
                predicates.add(cb.or(company, contact, email));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Client> clientPage = clientRepository.findAll(spec, pageRequest);

        List<ClientDto.ClientResponse> content = clientPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return new ClientDto.ClientPageResponse(
                content,
                clientPage.getNumber(),
                clientPage.getSize(),
                clientPage.getTotalElements(),
                clientPage.getTotalPages(),
                clientPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public List<ClientDto.ClientResponse> getAllActiveClients() {
        return clientRepository.findByStatusAndIsDeletedFalse("ACTIVE").stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ClientDto.ClientResponse getClientById(Long id) {
        Client client = clientRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
        return mapToResponse(client);
    }

    @Transactional
    public ClientDto.ClientResponse updateClient(Long id, ClientDto.UpdateClientRequest request) {
        Client client = clientRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        client.setCompanyName(request.getCompanyName().trim());
        client.setContactPerson(request.getContactPerson().trim());
        client.setPhone(request.getPhone());
        client.setAddress(request.getAddress());
        client.setCountry(request.getCountry());

        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            client.setStatus(request.getStatus().toUpperCase().trim());
            if (client.getUser() != null) {
                client.getUser().setStatus(client.getStatus());
                userRepository.save(client.getUser());
            }
        }

        Client updated = clientRepository.save(client);
        return mapToResponse(updated);
    }

    @Transactional
    public ClientDto.ClientResponse toggleClientStatus(Long id) {
        Client client = clientRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        String newStatus = "ACTIVE".equalsIgnoreCase(client.getStatus()) ? "INACTIVE" : "ACTIVE";
        client.setStatus(newStatus);
        if (client.getUser() != null) {
            client.getUser().setStatus(newStatus);
            userRepository.save(client.getUser());
        }

        Client saved = clientRepository.save(client);
        return mapToResponse(saved);
    }

    @Transactional
    public void softDeleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));

        client.setDeleted(true);
        client.setDeletedAt(Instant.now());
        client.setStatus("INACTIVE");

        if (client.getUser() != null) {
            client.getUser().setDeleted(true);
            client.getUser().setDeletedAt(Instant.now());
            client.getUser().setStatus("INACTIVE");
            userRepository.save(client.getUser());
        }

        clientRepository.save(client);
    }

    @Transactional
    public ClientDto.ClientResponse provisionOrResetPortalAccount(Long clientId, String rawPassword) {
        Client client = clientRepository.findById(clientId)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + clientId));

        String email = client.getEmail().toLowerCase().trim();
        String password = (rawPassword != null && !rawPassword.isBlank())
                ? rawPassword.trim()
                : "Client@" + (100 + (int)(Math.random() * 900));

        User clientUser = client.getUser();
        if (clientUser == null) {
            // Check if user already exists with this email
            clientUser = userRepository.findByEmailIgnoreCase(email).orElse(null);
            if (clientUser == null) {
                Role clientRole = roleRepository.findByRoleCode("CLIENT")
                        .orElseThrow(() -> new ResourceNotFoundException("Role CLIENT not found"));

                String[] nameParts = client.getContactPerson().trim().split("\\s+", 2);
                String firstName = nameParts[0];
                String lastName = nameParts.length > 1 ? nameParts[1] : "";

                clientUser = User.builder()
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(email)
                        .phone(client.getPhone())
                        .role(clientRole)
                        .passwordHash(passwordEncoder.encode(password))
                        .status("ACTIVE")
                        .isFirstLogin(true)
                        .isDeleted(false)
                        .build();
                clientUser = userRepository.save(clientUser);
            } else {
                clientUser.setPasswordHash(passwordEncoder.encode(password));
                clientUser.setFirstLogin(true);
                clientUser.setStatus("ACTIVE");
                clientUser = userRepository.save(clientUser);
            }
            client.setUser(clientUser);
            client = clientRepository.save(client);
        } else {
            clientUser.setPasswordHash(passwordEncoder.encode(password));
            clientUser.setFirstLogin(true);
            clientUser.setStatus("ACTIVE");
            userRepository.save(clientUser);
        }

        ClientDto.ClientResponse response = mapToResponse(client);
        response.setTemporaryPassword(password);
        return response;
    }

    public ClientDto.ClientResponse mapToResponse(Client client) {
        long projectCount = projectRepository.findByClient_ClientIdAndIsDeletedFalse(client.getClientId()).size();
        ClientDto.ClientResponse response = new ClientDto.ClientResponse(
                client.getClientId(),
                client.getCompanyName(),
                client.getContactPerson(),
                client.getEmail(),
                client.getPhone(),
                client.getAddress(),
                client.getCountry(),
                client.getStatus(),
                client.getUser() != null ? client.getUser().getUserId() : null,
                null,
                projectCount,
                client.getCreatedAt(),
                client.getUpdatedAt()
        );
        response.setHasPortalAccount(client.getUser() != null);
        return response;
    }

    @Transactional(readOnly = true)
    public ClientDto.ClientResponse getMyOrganization(Long userId) {
        Client client = clientRepository.findByUser_UserIdAndIsDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Client organization profile not found for user ID: " + userId));
        return mapToResponse(client);
    }
}
