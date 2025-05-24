package com.urlshortner.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(schema = "url_schema")
public class Url {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String originalUrl;
    @Column(unique = true)
    private String shortUrl;
    private Long count;
    private Long maxClicksAllowed;
    private boolean active = true;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private String password;
    private boolean isPasswordProtected;

}
