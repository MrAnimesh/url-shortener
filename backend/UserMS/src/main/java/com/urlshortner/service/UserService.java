package com.urlshortner.service;

import com.urlshortner.dto.UserDTO;

import java.util.Map;

public interface UserService {
	public Map<String, Object> registerUser(UserDTO userDTO);
	public String verifyEmail(String token) throws Exception;
	public String regenrateLink(String email);
}
