package com.urlshortner.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.urlshortner.entity.RefreshToken;

import jakarta.transaction.Transactional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long>{
	
	Optional<RefreshToken> findByToken(String token);
	
//	Optional<RefreshToken> findByUserEmail(String email);

	@Query("SELECT rt.users.email FROM RefreshToken rt WHERE rt.users.email = :email")
	Optional<String>findTokenByEmail(@Param("email") String email);
	
//	Optional<String>findByToken(String token);
	
	@Transactional
	@Modifying
	@Query("DELETE FROM RefreshToken rt WHERE rt.users.email = :email")
	void deleteExistingToken(@Param("email") String email);
	
	@Transactional
	@Modifying
	@Query("DELETE FROM RefreshToken rt WHERE rt.token = :token")
	void deleteExistingToken2(@Param("token") String token);

}
