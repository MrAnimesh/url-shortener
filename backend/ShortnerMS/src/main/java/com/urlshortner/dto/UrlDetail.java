package com.urlshortner.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class UrlDetail {
	
	private Long id;
	private String originalUrl;
	private String shortUrl;
	private Long userID;
	private LocalDateTime createdAt;
	
}
