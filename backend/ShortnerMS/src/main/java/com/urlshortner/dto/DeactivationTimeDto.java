package com.urlshortner.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DeactivationTimeDto {

	@NotBlank(message = "Short code is required.")
	private String shortCode;

	@NotNull(message = "Expiration time is required.")
	private LocalDateTime expiresAt;

}
