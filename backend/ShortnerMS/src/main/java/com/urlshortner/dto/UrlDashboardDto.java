package com.urlshortner.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UrlDashboardDto {
    private Long id;
    private String originalUrl;
    private String shortUrl;
    private Long count;
    private Long maxClicksAllowed;
    private boolean active;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private boolean passwordProtected;
    private String password;
    private boolean qrCodeAvailable;
}
