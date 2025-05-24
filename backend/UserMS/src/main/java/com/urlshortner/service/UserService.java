package com.urlshortner.service;

import java.util.Map;

import com.urlshortner.dto.UserDTO;

public interface UserService {
	public Map<String, Object> registerUser(UserDTO userDTO);
	public String verifyEmail(String token) throws Exception;
	public String regenrateLink(String email);
}
