package com.urlshortner.repository;

import com.urlshortner.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;
import com.urlshortner.enums.Role;
import jakarta.persistence.LockModeType;

@Repository
public interface UserRepository extends JpaRepository<Users, Long>{
	
	@EntityGraph(attributePaths = {"createdBy", "userPermissions", "userPermissions.permission"})
	Optional<Users> findByEmail(String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select u from Users u where u.id = :id")
    Optional<Users> findByIdForUpdate(@Param("id") Long id);
	
	boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    boolean existsByMobileNo(String mobileNo);

    boolean existsByMobileNoAndIdNot(String mobileNo, Long id);

    List<Users> findByCreatedByIdAndRoleOrderByCreatedAtDesc(Long createdById, Role role);
	
	@Query("SELECT u.verified FROM Users u WHERE u.email = :email")
	boolean isVerified(@Param("email")String email);
	
}
