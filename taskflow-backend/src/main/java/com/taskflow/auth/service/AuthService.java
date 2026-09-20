package com.taskflow.auth.service;

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

    public AuthService(AuthenticationManager authenticationManager,
                       UserRepository userRepository,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
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
            throw new UnauthorizedException("Your account is deactivated. Please contact an administrator.");
        }

        log.info("User {} authenticated successfully", user.getEmail());

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
            throw new BadRequestException("Current password does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);
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
