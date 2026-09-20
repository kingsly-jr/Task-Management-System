package com.taskflow.auth.service;

import com.taskflow.audit.service.AuditLogService;
import com.taskflow.auth.dto.*;
import com.taskflow.common.exception.BadRequestException;
import com.taskflow.common.exception.ResourceNotFoundException;
import com.taskflow.common.exception.UnauthorizedException;
import com.taskflow.security.JwtService;
import com.taskflow.security.UserPrincipal;
import com.taskflow.user.entity.User;
import com.taskflow.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder,
                       AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus()) || user.isDeleted()) {
            auditLogService.log(
                    user.getEmail(), user.getRole().getRoleCode(), "AUTH", "LOGIN",
                    "User", user.getUserId().toString(),
                    "Failed login attempt: Account deactivated", "127.0.0.1", "FAILED", null
            );
            throw new UnauthorizedException("Your account is deactivated. Please contact an administrator.");
        }

        log.info("User {} authenticated successfully", user.getEmail());

        auditLogService.log(
                user.getEmail(), user.getRole().getRoleCode(), "AUTH", "LOGIN",
                "User", user.getUserId().toString(),
                "User authenticated and established session successfully", "127.0.0.1", "SUCCESS",
                "{\"portalRole\":\"" + user.getRole().getRoleCode() + "\"}"
        );

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getUserId().toString());
        extraClaims.put("role", user.getRole().getRoleCode());
        if (user.getRoleCategory() != null) {
            extraClaims.put("roleCategory", user.getRoleCategory().getRoleCategoryCode());
        }

        String accessToken = jwtService.generateToken(principal, extraClaims);
        String refreshToken = jwtService.generateRefreshToken(principal);

        String portalPath = switch (user.getRole().getRoleCode()) {
            case "ADMIN" -> "/admin/dashboard";
            case "PROJECT_MANAGER" -> "/manager/dashboard";
            case "TEAM_MEMBER" -> "/member/dashboard";
            case "CLIENT" -> "/client/dashboard";
            default -> "/";
        };

        UserSummaryDto userSummary = mapToSummary(user);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(userSummary)
                .portalPath(portalPath)
                .build();
    }

    @Transactional(readOnly = true)
    public UserSummaryDto getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal().equals("anonymousUser")) {
            throw new UnauthorizedException("User is not authenticated");
        }

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return mapToSummary(user);
    }

    public LoginResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        String userEmail = jwtService.extractUsername(refreshToken);

        User user = userRepository.findByEmailIgnoreCaseAndIsDeletedFalse(userEmail)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token user"));

        UserPrincipal principal = new UserPrincipal(user);
        if (!jwtService.isTokenValid(refreshToken, principal)) {
            throw new UnauthorizedException("Refresh token is expired or invalid");
        }

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("userId", user.getUserId().toString());
        extraClaims.put("role", user.getRole().getRoleCode());
        if (user.getRoleCategory() != null) {
            extraClaims.put("roleCategory", user.getRoleCategory().getRoleCategoryCode());
        }

        String newAccessToken = jwtService.generateToken(principal, extraClaims);

        String portalPath = switch (user.getRole().getRoleCode()) {
            case "ADMIN" -> "/admin/dashboard";
            case "PROJECT_MANAGER" -> "/manager/dashboard";
            case "TEAM_MEMBER" -> "/member/dashboard";
            case "CLIENT" -> "/client/dashboard";
            default -> "/";
        };

        return LoginResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .user(mapToSummary(user))
                .portalPath(portalPath)
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Not authenticated");
        }

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            auditLogService.log(
                    user.getEmail(), user.getRole().getRoleCode(), "AUTH", "PASSWORD_CHANGE",
                    "User", user.getUserId().toString(),
                    "Password change rejected: Incorrect current password provided", "127.0.0.1", "WARNING", null
            );
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        auditLogService.log(
                user.getEmail(), user.getRole().getRoleCode(), "AUTH", "PASSWORD_CHANGE",
                "User", user.getUserId().toString(),
                "Password updated successfully", "127.0.0.1", "SUCCESS", null
        );
    }

    @Transactional
    public void firstLoginResetPassword(String newPassword) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Not authenticated");
        }

        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (newPassword == null || newPassword.trim().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword.trim()));
        user.setFirstLogin(false);
        userRepository.save(user);

        auditLogService.log(
                user.getEmail(), user.getRole().getRoleCode(), "AUTH", "FIRST_LOGIN_RESET",
                "User", user.getUserId().toString(),
                "First login password reset completed. Account fully activated.", "127.0.0.1", "SUCCESS", null
        );
    }

    public UserSummaryDto mapToSummary(User user) {
        return UserSummaryDto.builder()
                .userId(user.getUserId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFirstName() + " " + user.getLastName())
                .role(user.getRole().getRoleCode())
                .roleCategory(user.getRoleCategory() != null ? user.getRoleCategory().getRoleCategoryName() : null)
                .isFirstLogin(user.isFirstLogin())
                .status(user.getStatus())
                .build();
    }
}
