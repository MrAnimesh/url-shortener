package com.urlshortner.dto;

import java.time.LocalDateTime;
import java.util.List;

public record WorkerResponse(Long id,
                             String username,
                             String email,
                             String mobileNo,
                             String role,
                             boolean enabled,
                             Long createdBy,
                             List<PermissionResponse> permissions,
                             LocalDateTime createdAt,
                             LocalDateTime updatedAt) {
}
