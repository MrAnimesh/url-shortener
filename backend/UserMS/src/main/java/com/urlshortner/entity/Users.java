package com.urlshortner.entity;


import com.urlshortner.enums.Role;
import com.urlshortner.enums.Subscription;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@Table(schema = "user_schema")
public class Users {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    @Column(unique = true)
    @NotNull
    private String email;

    @Column(unique = true)
    private String mobileNo;

    @NotNull
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role = Role.ROLE_ADMIN;

    @Enumerated(EnumType.STRING)
    private Subscription subscription = Subscription.FREE;

    private boolean verified = false;
    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean enabled = true;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private Users createdBy;

    @OneToMany(mappedBy = "createdBy")
    private Set<Users> workers = new HashSet<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserPermission> userPermissions = new HashSet<>();

    @OneToOne(mappedBy = "users", cascade = CascadeType.ALL)
    private VerificationToken verificationToken;

    @OneToOne(mappedBy = "users", cascade = CascadeType.ALL)
    private RefreshToken refreshToken;

    @PreUpdate
    void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }
}
