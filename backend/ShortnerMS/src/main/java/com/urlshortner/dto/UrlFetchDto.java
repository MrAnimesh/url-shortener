package com.urlshortner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UrlFetchDto {
	@NotBlank(message = "Original URL is required.")
	private String originalUrl;
}
