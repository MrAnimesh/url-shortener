package com.urlshortner.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "refreshtoken", schema = "user_schema")
//@Data
@Getter
@Setter
public class RefreshToken {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@NotNull
	@Column(unique = true)
	private String token;
	
	@NotNull
	private Instant expiaryDate;
	
	@OneToOne(fetch  = FetchType.LAZY)
    @JoinColumn(name = "email", referencedColumnName = "email", nullable = false)  // Reference to Users.email
    private Users users;
}
