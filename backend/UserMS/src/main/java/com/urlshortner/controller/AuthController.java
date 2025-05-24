package com.urlshortner.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.repository.query.Param;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.urlshortner.dto.LogoutRefreshTokenRequest;
import com.urlshortner.dto.RegenerateRequest;
import com.urlshortner.dto.UserDTO;
import com.urlshortner.entity.RefreshToken;
import com.urlshortner.entity.Users;
import com.urlshortner.enums.Role;
import com.urlshortner.refreshservice.RefreshTokenService;
import com.urlshortner.refreshservice.TokenRefreshRequest;
import com.urlshortner.refreshservice.TokenRefreshResponse;
import com.urlshortner.repository.UserRepository;
import com.urlshortner.security.LoginRequest;
import com.urlshortner.security.LoginResponse;
import com.urlshortner.security.UserDetailsImpl;
import com.urlshortner.service.AuthService;
import com.urlshortner.service.UserService;
import com.urlshortner.utils.JwtUtils;

import jakarta.validation.Valid;


@RestController
@RequestMapping("/api")
public class AuthController {
	
	@Autowired
	private JwtUtils jwtUtils;
	
	@Autowired
	private UserService userService;
	
	@Autowired
	private RefreshTokenService refreshTokenService;
	
	@Autowired
	private AuthService authService;
	
	@PostMapping("/auth/public/register")
	public ResponseEntity<Map<String, Object>> registerUser(@RequestBody @Valid UserDTO userDTO){
		Map<String, Object> response = userService.registerUser(userDTO);
		if(response.get("exists").equals(false)) {
			return new ResponseEntity<Map<String,Object>>(response, HttpStatus.CREATED);
			
		}else if(response.get("exists").equals(true) && response.get("verified").equals(false)) {
			return new ResponseEntity<Map<String,Object>>(response, HttpStatus.FORBIDDEN);
		}else {
			return new ResponseEntity<Map<String,Object>>(response, HttpStatus.CONFLICT);
		}
	}
	
	@GetMapping("/auth/public/verify")
	public ResponseEntity<String> verifyEmail(@RequestParam("token") String token) throws Exception{
		String msg = userService.verifyEmail(token);
		return new ResponseEntity<String>("msg", HttpStatus.OK);
	}

	
	@PostMapping("/auth/public/signin")
	public ResponseEntity<LoginResponse> authenticateUser(@RequestBody LoginRequest loginRequest){
		
		LoginResponse response = authService.authenticateUser(loginRequest);
		return new ResponseEntity<>(response, HttpStatus.OK);

	}
	
	@PostMapping("/auth/public/refreshtoken")
	  public ResponseEntity<?> refreshtoken(@RequestBody TokenRefreshRequest request) throws Exception {
	    String requestRefreshToken = request.getRefreshToken();
	    RefreshToken refreshToken = refreshTokenService.findByToken(requestRefreshToken).orElseThrow(()-> new Exception("Token not found, Login again"));
	    RefreshToken token =  refreshTokenService.verifyExpiration(refreshToken);
	    
	    Users user = token.getUsers();
	    
	    String newAccessToken = jwtUtils.generateTokenFromUsername(user.getEmail(), user.getId());
	    
	    TokenRefreshResponse response = new TokenRefreshResponse(newAccessToken, requestRefreshToken);
	    
	    return  new ResponseEntity<Object>(response, HttpStatus.OK);

	  }
	@PostMapping("/auth/public/regeneratelink")
	public ResponseEntity<String> regenerateLink(@RequestBody RegenerateRequest request){
		String message = userService.regenrateLink(request.getEmail());
		return new ResponseEntity<String>(message, HttpStatus.OK);
	}
	
	@GetMapping("/auth/private/logout/{email}")
	public ResponseEntity<?> logoutUser(@PathVariable("email") String email) {
		System.out.println("logout: "+email);
		String message = authService.logoutUser(email);
	    SecurityContextHolder.clearContext(); // Clears the authentication
	    return ResponseEntity.ok(Map.of("message", message, "status", true));
	}
	
	
	
//	@GetMapping("/auth/public/logout")
//	public ResponseEntity<?> logout(@RequestParam("refreshToken") String refreshToken){
//		System.out.println("Inside new logout");
//		String message = authService.logoutUser2(refreshToken);
//		SecurityContextHolder.clearContext(); // Clears the authentication
//	    return ResponseEntity.ok(Map.of("message", message, "status", true));
//	}
	@PostMapping("/auth/public/logout")
	public ResponseEntity<?> logout(@RequestBody LogoutRefreshTokenRequest refreshToken){
		System.out.println("Inside new logout");
		String message = authService.logoutUser2(refreshToken.getRefreshToken());
		SecurityContextHolder.clearContext(); // Clears the authentication
	    return ResponseEntity.ok(Map.of("message", message, "status", true));
	}
	
	
	@GetMapping("/say")
	public String sayHello() {
		return "Hello";
	}
	
	@GetMapping("/verifytoken")
	public ResponseEntity<String> accessTokenVerification(){
		return new ResponseEntity<>("Verification Success", HttpStatus.OK);
	}
	
//	@PreAuthorize("hasRole('USER')")
//	@GetMapping("/user")
//	public String userEndpoint() { // If role not matched then stopping user to execute the method.
//		return "Hello, User";
//	}
//	@PreAuthorize("hasRole('ADMIN')")
//	@GetMapping("/admin")
//	public String adminEndpoint() {
//		return "Hello, Admin";
//	}

}
