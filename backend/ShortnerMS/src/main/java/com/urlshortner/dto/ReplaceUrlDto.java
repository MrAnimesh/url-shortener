package com.urlshortner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplaceUrlDto {
	@NotBlank(message = "Short code is required.")
	private String shortCode;

	@NotBlank(message = "New URL is required.")
	private String newUrl;
}
