package com.urlshortner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UrlFetchForCustomDto {
	@NotBlank(message = "Custom URL is required.")
	private String customUrl;

	@NotBlank(message = "Original URL is required.")
	private String originalUrl;
}
