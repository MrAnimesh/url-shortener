package com.urlshortner.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.urlshortner.entity.Users;

@Repository
public interface UserRepository extends JpaRepository<Users, Long>{
	
	Optional<Users> findByEmail(String email);
	
	boolean existsByEmail(String email);
	
	@Query("SELECT u.verified FROM Users u WHERE u.email = :email")
	boolean isVerified(@Param("email")String email);
	
}
