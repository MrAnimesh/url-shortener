package com.urlshortner.dto;

import lombok.Data;

@Data
public class LogoutRefreshTokenRequest {
	
	private String refreshToken;

}
