package com.urlshortner.entity;


import com.urlshortner.enums.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Data
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

    @Column(unique = true)
    @NotNull
    private String password;

    @Enumerated(EnumType.STRING)
    private Role role = Role.ROLE_ADMIN;

    private boolean verified = false;
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne(mappedBy = "users", cascade = CascadeType.ALL)
    private VerificationToken verificationToken;

    @OneToOne(mappedBy = "users", cascade = CascadeType.ALL)
    private RefreshToken refreshToken;

}
