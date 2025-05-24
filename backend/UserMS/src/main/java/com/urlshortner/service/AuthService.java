package com.urlshortner.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.urlshortner.entity.RefreshToken;
import com.urlshortner.exception.CustomAuthenticationException;
import com.urlshortner.refreshservice.RefreshTokenService;
import com.urlshortner.repository.RefreshTokenRepository;
import com.urlshortner.security.LoginRequest;
import com.urlshortner.security.LoginResponse;
import com.urlshortner.security.UserDetailsImpl;
import com.urlshortner.utils.JwtUtils;

@Service
public class AuthService {
	
	@Autowired
	private JwtUtils jwtUtils;
	@Autowired
	private AuthenticationManager authenticationManager;
	
	@Autowired
	private RefreshTokenService refreshTokenService;
	
	public LoginResponse authenticateUser(LoginRequest loginRequest) {
		System.out.println(loginRequest.getEmail());
		
		refreshTokenService.deleteExistingRefreshToken(loginRequest.getEmail());
		
		try {
			Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
			SecurityContextHolder.getContext().setAuthentication(authentication);
			
//			UserDetails userDetails = (UserDetails) authentication.getPrincipal();
			UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

			
			String jwtToken = jwtUtils.generateTokenFromUsername(userDetails.getUsername(), userDetails.getId());
		    RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

			
			List<String> roles = userDetails.getAuthorities().stream().map(item -> item.getAuthority()).collect(Collectors.toList());
			
			LoginResponse response = new LoginResponse(jwtToken, refreshToken.getToken(), userDetails.getUsername(), roles, userDetails.getId());
			return response;
		}catch(AuthenticationException e) {			
			throw new CustomAuthenticationException("Invalid email or password");
		}
		
	}
	
	public String logoutUser(String email) {
		refreshTokenService.deleteExistingRefreshToken(email);
		return "User Logged out successfully.";
	}
	
	public String logoutUser2(String refreshToken) {
		refreshTokenService.deleteExistingRefreshToken2(refreshToken);
		return "User Logged out successfully.";
	}

}
