package com.urlshortner.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UrlPasswordDto {

	@NotBlank(message = "URL password is required.")
	private String urlPassword;

	@NotBlank(message = "Short code is required.")
	private String shortCode;

}
