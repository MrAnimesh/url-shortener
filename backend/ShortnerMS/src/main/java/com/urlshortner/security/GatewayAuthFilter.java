package com.urlshortner.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class GatewayAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String actorId = request.getHeader("X-Actor-Id");
        String role = request.getHeader("X-Role");
        if (actorId != null && role != null && !role.isBlank()) {
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            authorities.add(new SimpleGrantedAuthority(role));

            String permissions = request.getHeader("X-Permissions");
            if (permissions != null && !permissions.isBlank()) {
                Arrays.stream(permissions.split(","))
                        .map(String::trim)
                        .filter(permission -> !permission.isEmpty())
                        .map(SimpleGrantedAuthority::new)
                        .forEach(authorities::add);
            }

            String subscription = request.getHeader("X-Subscription");
            if (subscription != null && !subscription.isBlank()) {
                authorities.add(new SimpleGrantedAuthority("SUBSCRIPTION_" + subscription));
            }

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(actorId, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        filterChain.doFilter(request, response);
    }
}
