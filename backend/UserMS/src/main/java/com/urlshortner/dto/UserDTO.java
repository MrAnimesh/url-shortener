package com.urlshortner.dto;

import com.urlshortner.enums.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserDTO {
	private Long id;
	private String username;
	@NotNull(message = "Email should not be null")
	private String email;
	private String mobileNo;
	@NotNull(message = "Password can't be null")
	private String password;
	private Role Role;
	private LocalDateTime createdAt = LocalDateTime.now();
}
