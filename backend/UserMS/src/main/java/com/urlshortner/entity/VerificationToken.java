package com.urlshortner.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

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
