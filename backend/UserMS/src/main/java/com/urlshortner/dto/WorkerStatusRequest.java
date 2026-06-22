package com.urlshortner.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WorkerStatusRequest {
    @NotNull(message = "Enabled status is required")
    private Boolean enabled;
}
