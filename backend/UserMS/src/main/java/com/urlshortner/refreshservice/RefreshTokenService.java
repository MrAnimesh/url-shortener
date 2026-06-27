package com.urlshortner.refreshservice;

import com.urlshortner.entity.RefreshToken;
import com.urlshortner.exception.TokenExpiredException;
import com.urlshortner.repository.RefreshTokenRepository;
import com.urlshortner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {
	
	@Value("${app.refresh-token-duration-ms:2400000}")
	private Long refreshTokenDurationMs;
	
	@Autowired
	private RefreshTokenRepository refreshTokenRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	public Optional<RefreshToken> findByToken(String token) {
	    return refreshTokenRepository.findByToken(token);
	 }
	
	public RefreshToken createRefreshToken(Long userId) {
	    RefreshToken refreshToken = new RefreshToken();

	    refreshToken.setUsers(userRepository.findById(userId)
				.orElseThrow(() -> new IllegalArgumentException("User not found.")));
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
	    Optional<RefreshToken> optionalToken = refreshTokenRepository.findByToken(token);
	    
	    if (optionalToken.isPresent()) {
	        refreshTokenRepository.deleteExistingToken2(token);
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
