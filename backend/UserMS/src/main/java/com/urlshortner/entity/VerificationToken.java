package com.urlshortner.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(schema = "user_schema")
public class VerificationToken {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotNull
	@Column(unique = true)
	private String token;
	
	@NotNull
	private LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(30);
	
	private boolean attempted = false;
	
	@OneToOne(fetch  = FetchType.LAZY)
    @JoinColumn(name = "email", referencedColumnName = "email", nullable = false)  // Reference to Users.email
    private Users users;
}
