package com.urlshortner.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class QrGenerateRequest {
    @NotNull(message = "URL ID is required.")
    @Positive(message = "URL ID must be greater than zero.")
    private Long urlId;
}
