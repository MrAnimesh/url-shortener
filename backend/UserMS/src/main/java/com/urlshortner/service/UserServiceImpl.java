package com.urlshortner.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.urlshortner.dto.UserDTO;
import com.urlshortner.entity.Users;
import com.urlshortner.entity.VerificationToken;
import com.urlshortner.repository.RefreshTokenRepository;
import com.urlshortner.repository.UserRepository;
import com.urlshortner.repository.VerificationTokenRepository;

@Service(value = "userService")
@Transactional
public class UserServiceImpl implements UserService{
	
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private VerificationTokenRepository tokenRepository;
	@Autowired
	private EmailService emailService;
	@Autowired
	private PasswordEncoder passwordEncoder;
	
	
	@Override
	public Map<String, Object> registerUser(UserDTO userDTO){
		Map<String, Object> map = new HashMap<>();
		if(userRepository.existsByEmail(userDTO.getEmail())) {
			if(!userRepository.isVerified(userDTO.getEmail())) {
				map.put("email", userDTO.getEmail());
				map.put("verified", false);
				map.put("exists", true);
				map.put("message", "It looks like you’ve already registered, but your email is not verified. Please check your email for the verification link.");
				return map;
			}else {
				map.put("email", userDTO.getEmail());
				map.put("exists", true);
				map.put("verified", true);
				map.put("message", "You are alreay registered, kindly login.");
				return map;
			}
		}
		Users user = new Users();
		user.setEmail(userDTO.getEmail());
		user.setUsername(userDTO.getUsername());
		user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
		Long id = userRepository.save(user).getId();
		
		String token = UUID.randomUUID().toString();
		VerificationToken verificationToken = new VerificationToken();
		verificationToken.setUsers(user);
		verificationToken.setToken(token);
		tokenRepository.save(verificationToken);
		
		emailService.sendVerificationEmial(userDTO.getEmail(), token);
		
		map.put("email", userDTO.getEmail());
		map.put("verified", false);
		map.put("exists", false);
		map.put("message", "Almost there! We’ve sent a verification email to your inbox. Please verify your email within the next 24 hours to activate your account.");
		
		return map;
	}
	
	@Override
	public String regenrateLink(String email) {
		if(userRepository.isVerified(email)) {
			return "You have already registerd, go to the login page.";
		}else {
			String token = UUID.randomUUID().toString();
			tokenRepository.updateToken(token, email);
			emailService.sendVerificationEmial(email, token);
			return "Your new verification link has been generated, kindly check you email";
		}
	}

	@Override
	public String verifyEmail(String token) throws Exception {
		// TODO Auto-generated method stub
		Optional<VerificationToken> Token =  tokenRepository.findByToken(token);
		VerificationToken verificationToken = Token.orElseThrow(()-> new Exception("Token not found"));
		
		if(verificationToken.isAttempted()) {
			return "This link have already been used.";
		}
		
		if(verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
			throw new Exception("Token has expired, kindly request a new one.");
		}
		
		
		verificationToken.setAttempted(true);
		Users user = verificationToken.getUsers();
		user.setVerified(true);
		userRepository.save(user);
		tokenRepository.delete(verificationToken);
		
		
		return "Thank you, Email has been verified.";
	}
	
//	public String verifyOtp(Integer otp) throws Exception {
//		Optional<VerificationToken> Otp =  tokenRepository.findByOtp(otp);
//		VerificationToken verificationToken = Otp.orElseThrow(()-> new Exception("Token not found"));
//		if(verificationToken.isAttempted()) {
//			return "This link have already been used.";
//		}
//
//	}

}
