package com.urlshortner.utils;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.List;
import java.util.stream.Collectors;
//import java.util.logging.Logger;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
//import org.hibernate.validator.internal.util.logging.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwt;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import reactor.core.publisher.Mono;

@Component
public class AuthTokenFilter implements GlobalFilter, Ordered {

    @Value("${spring.app.jwtSecret}")
    private String secret;
    
    private static final Logger logger = LoggerFactory.getLogger(AuthTokenFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getURI().getPath();

        if (path.startsWith("/verify-password") || path.matches("^/[^/]+$") || path.startsWith("/api/v1/urls/public") || path.startsWith("/actuator/health") || path.startsWith("/api/v1/auth/public") || path.equals("/api/v1/payments/webhooks/razorpay")) {
            return chain.filter(exchange);
        }
        
        JwtParser parser = Jwts.parser()
                .verifyWith((SecretKey) key())
                .build();

        

        

        
        

        String authHeader = request.getHeaders().getFirst("Authorization");


        // If no auth header, let Spring Security handle it based on path rules
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        

        
        try {
        	String token = authHeader.substring(7);

            // For older versions of JJWT that don't have parserBuilder()
        	Jwt<?, Claims> jwt = Jwts.parser().verifyWith((SecretKey) key()).build().parseSignedClaims(token);
        	
//             = parser.parseSignedClaims(token);
            Claims claims = jwt.getPayload();

            Number userIdClaim = claims.get("userId", Number.class);
            Number ownerIdClaim = claims.get("ownerId", Number.class);
            Long userId = userIdClaim.longValue();
            Long ownerId = ownerIdClaim == null ? null : ownerIdClaim.longValue();
            String role = claims.get("role", String.class);
            String subType = claims.get("subscriptionType", String.class);
            List<?> permissionClaims = claims.get("permissions", List.class);
            String permissions = permissionClaims == null ? "" : permissionClaims.stream()
                    .map(String::valueOf)
                    .collect(Collectors.joining(","));
            Long effectiveOwnerId = ownerId == null ? userId : ownerId;
            logger.debug("Authenticated actor {} for owner {}", userId, effectiveOwnerId);
            
        	ServerHttpRequest mutatedRequest = request.mutate()
				    .headers(headers -> {
                            headers.remove("X-Actor-Id");
                            headers.remove("X-User-Id");
                            headers.remove("X-Role");
                            headers.remove("X-Permissions");
                            headers.remove("X-Subscription");
                            headers.set("X-Actor-Id", String.valueOf(userId));
                            headers.set("X-User-Id", String.valueOf(effectiveOwnerId));
                            headers.set("X-Role", role == null ? "" : role);
                            headers.set("X-Permissions", permissions);
                            headers.set("X-Subscription", subType == null ? "FREE" : subType);
                        })
        		    .build();
        	
            // Token is valid, continue with the filter chain
        	return chain.filter(exchange.mutate().request(mutatedRequest).build());
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    @Override
    public int getOrder() {
        return -1; // Execute this filter before other filters
    }

    private Key key() {
		return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
	}
}
