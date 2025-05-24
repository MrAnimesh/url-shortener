package com.urlshortner.security;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LoginResponse {
	
	private Long id;
	private String jwtToken;
	private String refreshToken;
	private String email;
	private List<String> roles;
	
	private Map<String, Object> map;
	
	
	
	public LoginResponse(String jwtToken, String refreshToken, String email, List<String> roles, Long id) {
		this.jwtToken = jwtToken;
		this.email = email;
		this.roles = roles;
		this.refreshToken = refreshToken;
		this.id = id;
	}
	
	public LoginResponse(Map<String, Object> map) {
		this.map = map;
	}
	
	public String getJwtToken() {
		return jwtToken;
	}
	public void setJwtToken(String jwtToken) {
		this.jwtToken = jwtToken;
	}
	public String getUsername() {
		return email;
	}
	public void setUsername(String email) {
		this.email = email;
	}
	public List<String> getRoles() {
		return roles;
	}
	public void setRoles(List<String> roles) {
		this.roles = roles;
	}
	public String getRefreshToken() {
		return refreshToken;
	}
	public void setRefreshToken(String refreshToken) {
		this.refreshToken = refreshToken;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}
	
	
	
	
	
	
	
	
}
