package com.urlshortner.utils;

import com.urlshortner.security.UserDetailsImpl;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.security.Key;
import java.util.Base64;
import java.util.Date;

@Component
public class JwtUtils {
	
	@Value("${spring.app.jwtSecret}")
	private String jwtSecret;
	
	@Value("${spring.app.jwtExpirationMs}")
	private int jwtExpiration;
	
	public String getJwtFromHeader(HttpServletRequest request) {
		String bearerToken = request.getHeader("Authorization");
		
		if(bearerToken != null && bearerToken.startsWith("Bearer ")) {
			return bearerToken.substring(7);
		}
		return null;
	}
	
	public String generateToken(UserDetailsImpl userDetails) {
		return Jwts.builder()
				.subject(userDetails.getUsername())
				.claim("userId", userDetails.getId())
				.claim("ownerId", userDetails.getOwnerId())
				.claim("role", userDetails.getRole())
				.claim("permissions", userDetails.getPermissions())
				.claim("subscriptionType", userDetails.getSub_type())
				.issuedAt(new Date())
				.expiration(new Date((new Date()).getTime()+jwtExpiration))
				.signWith(key())
				.compact();
	}
	
	private Key key() {
		return Keys.hmacShaKeyFor(Base64.getDecoder().decode(jwtSecret));
	}
	
	public String getUserNameFromJwtToken(String token) {
		return Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(token).getPayload().getSubject();
	}
	
	public boolean validateJwtToken(String authToken) {
		try {
			Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(authToken);
			return true;
		}catch(MalformedJwtException e) {
		}catch(ExpiredJwtException e) {
		}catch(UnsupportedJwtException e) {
		}catch(IllegalArgumentException e) {
		}
		return false;
	}
	
	
	
	
}
