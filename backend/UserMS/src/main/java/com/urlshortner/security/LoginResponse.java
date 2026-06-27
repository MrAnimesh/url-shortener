package com.urlshortner.security;

import com.urlshortner.enums.Subscription;

import java.util.List;
import java.util.Map;

public class LoginResponse {
	
	private Long id;
	private String jwtToken;
	private String refreshToken;
	private String email;
	private String username;
	private List<String> roles;
	private Subscription isPremiumUser;
	
	private Map<String, Object> map;
	
	
	
	public LoginResponse(String jwtToken, String refreshToken, String email, String username, List<String> roles, Long id, Subscription isPremiumUser) {
		this.jwtToken = jwtToken;
		this.email = email;
		this.username = username;
		this.roles = roles;
		this.refreshToken = refreshToken;
		this.id = id;
		this.isPremiumUser = isPremiumUser;
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
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
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
	public Subscription getIsPremiumUser() {
		return isPremiumUser;
	}
	
	
	
	
	
	
	
	
}
