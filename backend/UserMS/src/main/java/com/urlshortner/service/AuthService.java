package com.urlshortner.service;

import com.urlshortner.entity.RefreshToken;
import com.urlshortner.exception.CustomAuthenticationException;
import com.urlshortner.refreshservice.RefreshTokenService;
import com.urlshortner.entity.Users;
import com.urlshortner.repository.UserRepository;
import com.urlshortner.security.LoginRequest;
import com.urlshortner.security.LoginResponse;
import com.urlshortner.security.UserDetailsImpl;
import com.urlshortner.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthService {
	
	@Autowired
	private JwtUtils jwtUtils;
	@Autowired
	private AuthenticationManager authenticationManager;
	
	@Autowired
	private RefreshTokenService refreshTokenService;
	@Autowired
	private UserRepository userRepository;
	
	public LoginResponse authenticateUser(LoginRequest loginRequest) {
		refreshTokenService.deleteExistingRefreshToken(loginRequest.getEmail());
		
		try {
			Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
			SecurityContextHolder.getContext().setAuthentication(authentication);
			
//			UserDetails userDetails = (UserDetails) authentication.getPrincipal();
			UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

			
			String jwtToken = jwtUtils.generateToken(userDetails);
		    RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getId());

			
			List<String> roles = userDetails.getAuthorities().stream().map(item -> item.getAuthority()).collect(Collectors.toList());
			
			LoginResponse response = new LoginResponse(jwtToken, refreshToken.getToken(), userDetails.getUsername(), roles, userDetails.getId(), userDetails.getSub_type());
			System.out.println("subscription type in auth service: " + userDetails.getSub_type());
			return response;
		}catch(AuthenticationException e) {
			Users user = findUser(loginRequest.getEmail());
			if (user != null && !user.isEnabled()) {
				throw new CustomAuthenticationException("Account is disabled");
			}
			if (user != null && !user.isVerified()) {
				throw new CustomAuthenticationException(
						"Account is pending email verification. Please check your email for the verification link.");
			}
			throw new CustomAuthenticationException("Invalid email or password");
		}
		
	}

	private Users findUser(String email) {
		if (email == null || email.isBlank()) {
			return null;
		}
		return userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
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
