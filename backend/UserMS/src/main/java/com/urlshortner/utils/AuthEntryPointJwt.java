package com.urlshortner.utils;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint{
	
	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response,
			AuthenticationException authException) throws IOException, ServletException {
		// TODO Auto-generated method stub
		System.out.println("hi: "+authException);
		String path = request.getServletPath();
		
		if (path.startsWith("/actuator/")) {  // Adjust if context path exists
            response.setStatus(HttpServletResponse.SC_OK); // Or handle differently
            return;
        }
		
		response.setContentType(MediaType.APPLICATION_JSON_VALUE);
		response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
		
		final Map<String, Object> body = new HashMap<>();
		
		body.put("Status", HttpServletResponse.SC_UNAUTHORIZED);
		body.put("Error", "Unauthorized");
		body.put("Message", authException.getMessage());
		body.put("Path", request.getServletPath());
		
		// Mapping body into JSON format
		final ObjectMapper mapper = new ObjectMapper();
		mapper.writeValue(response.getOutputStream(),body);
		
	}
}
