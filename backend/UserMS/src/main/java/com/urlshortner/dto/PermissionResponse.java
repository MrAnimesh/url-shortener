package com.urlshortner.dto;

import com.urlshortner.enums.PermissionName;

public record PermissionResponse(Long id, PermissionName name, String description) {
}
