package com.urlshortner.utils;

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
	
	public String generateTokenFromUsername(String username, Long userId) {
//		String username = userDetails.getUsername();
//		System.out.println("user: "+username);
		
		return Jwts.builder()
				.subject(username)
				.claim("userId", userId.longValue())
				.issuedAt(new Date())
				.expiration(new Date((new Date()).getTime()+jwtExpiration))
				.signWith(key())
				.compact();
	}
	
	private Key key() {
		return Keys.hmacShaKeyFor(Decoders.BASE64.decode(jwtSecret));
	}
	
	public String getUserNameFromJwtToken(String token) {
		return Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(token).getPayload().getSubject();
	}
	
	public boolean validateJwtToken(String authToken) {
		try {
			System.out.println("Validate"+ authToken);
			Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(authToken);
			return true;
		}catch(MalformedJwtException e) {
			System.out.println("Invalid jwt token: {}"+ e.getMessage());
		}catch(ExpiredJwtException e) {
			System.out.println("Jwt token is expired: {}"+ e.getMessage());
		}catch(UnsupportedJwtException e) {
			System.out.println("Unsupported token: {}"+ e.getMessage());
		}catch(IllegalArgumentException e) {
			System.out.println("Jwt claims string is empty: {}"+ e.getMessage());
		}
		return false;
	}
	
	
	
	
}
