package com.urlshortner.dto;

import com.urlshortner.enums.PermissionName;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.LinkedHashSet;
import java.util.Set;

@Data
public class PermissionUpdateRequest {
    @NotNull(message = "Permissions are required")
    private Set<PermissionName> permissions = new LinkedHashSet<>();
}
