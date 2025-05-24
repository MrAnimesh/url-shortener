package com.urlshortner.refreshservice;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.urlshortner.entity.RefreshToken;
import com.urlshortner.exception.TokenExpiredException;
import com.urlshortner.repository.RefreshTokenRepository;
import com.urlshortner.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class RefreshTokenService {
	
	private Long refreshTokenDurationMs = 2400000L;
	
	@Autowired
	private RefreshTokenRepository refreshTokenRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	public Optional<RefreshToken> findByToken(String token) {
	    return refreshTokenRepository.findByToken(token);
	 }
	
	public RefreshToken createRefreshToken(Long userId) {
	    RefreshToken refreshToken = new RefreshToken();

	    refreshToken.setUsers(userRepository.findById(userId).get());
	    refreshToken.setExpiaryDate(Instant.now().plusMillis(refreshTokenDurationMs));
	    refreshToken.setToken(UUID.randomUUID().toString());

	    refreshToken = refreshTokenRepository.save(refreshToken);
	    return refreshToken;
	}
	
	public void deleteExistingRefreshToken(String email) {
		Optional<String> optionalEmail = refreshTokenRepository.findTokenByEmail(email);
		if(optionalEmail.isPresent()) {
			String email_present = optionalEmail.get();
			refreshTokenRepository.deleteExistingToken(email_present);
		}
	}
	
	public void deleteExistingRefreshToken2(String token) {
	    System.out.println("I'm here: " + token);

	    Optional<RefreshToken> optionalToken = refreshTokenRepository.findByToken(token);
	    
	    if (optionalToken.isPresent()) {
	        RefreshToken newToken = optionalToken.get();
	        System.out.println("New Token: " + newToken);
	        
	        System.out.println("Deleted");
	        refreshTokenRepository.deleteExistingToken2(token);
	    } else {
	        System.out.println("Token not found.");
	    }
	}

	
	
	public RefreshToken verifyExpiration(RefreshToken token) throws Exception {
	    if (token.getExpiaryDate().compareTo(Instant.now()) < 0) {
	      refreshTokenRepository.delete(token);
	      throw new TokenExpiredException(token.getToken()+ "Refresh token was expired. Please make a new signin request");
	    }

	    return token;
	  }
	
	
}
