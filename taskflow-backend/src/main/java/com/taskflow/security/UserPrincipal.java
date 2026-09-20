package com.taskflow.security;

import com.taskflow.user.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.UUID;

public class UserPrincipal implements UserDetails {

    private final UUID id;
    private final String email;
    private final String password;
    private final String firstName;
    private final String lastName;
    private final String roleCode;
    private final String roleCategoryCode;
    private final boolean isFirstLogin;
    private final Collection<? extends GrantedAuthority> authorities;

    public UserPrincipal(User user) {
        this.id = user.getUserId();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.firstName = user.getFirstName();
        this.lastName = user.getLastName();
        this.roleCode = user.getRole().getRoleCode();
        this.roleCategoryCode = user.getRoleCategory() != null ? user.getRoleCategory().getRoleCategoryCode() : null;
        this.isFirstLogin = user.isFirstLogin();
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + this.roleCode));
    }

    public UUID getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getRoleCode() {
        return roleCode;
    }

    public String getRoleCategoryCode() {
        return roleCategoryCode;
    }

    public boolean isFirstLogin() {
        return isFirstLogin;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
