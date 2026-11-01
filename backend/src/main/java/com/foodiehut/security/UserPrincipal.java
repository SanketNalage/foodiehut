package com.foodiehut.security;

import com.foodiehut.entity.Role;
import com.foodiehut.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String fullName;
    private final String email;
    private final String phone;
    private final Role role;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean active;

    public UserPrincipal(Long id, String fullName, String email, String phone, Role role, boolean active) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.role = role;
        this.active = active;
        this.authorities = Collections.singletonList(new SimpleGrantedAuthority(role.name()));
    }

    public static UserPrincipal create(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.isActive()
        );
    }

    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getEmail() { return email; }
    public String getPhone() { return phone; }
    public Role getRole() { return role; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

    @Override
    public String getPassword() { return ""; } // Passwordless OTP-based

    @Override
    public String getUsername() { return email; }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return active; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return active; }
}

