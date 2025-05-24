package com.urlshortner.dto;

import lombok.Data;

@Data
public class ReplaceUrlDto {
	private String shortCode;
	private String newUrl;
}
