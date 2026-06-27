package com.urlshortner.repository;

import com.urlshortner.entity.VerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long>{
	Optional<VerificationToken> findByToken(String token);
//	Optional<VerificationToken> findByOtp(Integer otp);
	
	@Modifying
	@Query("""
			UPDATE VerificationToken v
			SET v.token = :newToken,
				v.expiryDate = :expiryDate,
				v.attempted = false
			WHERE v.users.email = :email
			""")
	Integer updateToken(@Param("newToken") String newToken,
						@Param("expiryDate") LocalDateTime expiryDate,
						@Param("email") String email);

}
