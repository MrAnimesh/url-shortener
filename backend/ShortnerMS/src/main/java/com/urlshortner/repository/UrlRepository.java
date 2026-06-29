package com.urlshortner.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.urlshortner.entity.Url;
import com.urlshortner.dto.UrlDashboardDto;

import jakarta.transaction.Transactional;

@Repository
public interface UrlRepository extends JpaRepository<Url, Long> {
    public boolean existsByShortUrl(String shortUrl);
    public Optional<Url> findByShortUrl(String shortCode);
    public Optional<Url> findByIdAndUserId(Long id, Long userId);
    public Optional<Url> findByShortUrlAndUserId(String shortUrl, Long userId);
    public long countByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(u.count), 0) FROM Url u")
    public Long sumClicksTracked();
    
//    public Integer deleteByShortUrl(String shortCode);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM url_schema.url WHERE user_id = :userId AND short_url = :shortCode", nativeQuery = true)
    public Integer deleteByShortUrl(@Param("shortCode") String shortCode, @Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query(value = "DELETE FROM url_schema.url WHERE user_id IS NULL AND created_at < NOW() - INTERVAL '5 minutes'", nativeQuery = true)
    void deleteOldAnonymousUrls();
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE url_schema.url SET expires_at = :expiresAt WHERE short_url = :shortCode AND user_id = :userId", nativeQuery = true)
    public int setUserSpeccifiedDeactivationTime( @Param("shortCode") String shortCode, @Param("userId") Long userId, @Param("expiresAt") LocalDateTime expiresAt);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE url_schema.url SET expires_at = NULL WHERE short_url = :shortCode AND user_id = :userId", nativeQuery = true)
    public int resetDeactivationTime( @Param("shortCode") String shortCode, @Param("userId") Long userId);
    
    @Query("""
            SELECT new com.urlshortner.dto.UrlDashboardDto(
                u.id,
                u.originalUrl,
                u.shortUrl,
                u.count,
                u.maxClicksAllowed,
                u.active,
                u.userId,
                u.createdAt,
                u.expiresAt,
                u.isPasswordProtected,
                u.password,
                CASE WHEN q.id IS NULL THEN false ELSE true END
            )
            FROM Url u
            LEFT JOIN QrDetail q ON q.urlId = u.id AND q.userId = :userId
            WHERE u.userId = :userId
            """)
    public List<UrlDashboardDto> findDashboardUrls(@Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE url_schema.url SET active = TRUE WHERE short_url = :shortCode AND user_id = :userId", nativeQuery = true)
    public int activateUrl(@Param("shortCode") String shortCode, @Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE url_schema.url SET active = FALSE WHERE short_url = :shortCode AND user_id = :userId", nativeQuery = true)
    public int deactivateUrl(@Param("shortCode") String shortCode, @Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE url_schema.url\n"
    				+ "SET active = FALSE\n"
    				+ "WHERE expires_at IS NOT NULL\n"
    				+ "  AND active = TRUE\n"
    				+ "  AND expires_at <= NOW();\n"
    				+ "", nativeQuery = true)
    public void deactivateAtUserSpecifiedTime();
    
    @Query(value = "SELECT u.active FROM url_schema.url u WHERE u.short_url = :shortCode", nativeQuery = true)
    public boolean isEnabledOrDisabled(@Param("shortCode") String shortCode);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE url_schema.url SET original_url = :newUrl WHERE short_url = :shortCode AND user_id = :userId", nativeQuery = true)
    public int updateOriginalUrl(@Param("newUrl") String newUrl, @Param("shortCode") String shortCode, @Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE url_schema.url SET max_clicks_allowed = :maxClicks WHERE short_url = :shortCode AND user_id = :userId", nativeQuery = true)
    public int updateMaxClicksAllowed(@Param("shortCode") String shortCode, @Param("maxClicks") Long maxClicks ,@Param("userId") Long userId);
    
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE url_schema.url SET max_clicks_allowed = NULL WHERE short_url = :shortCode AND user_id = :userId", nativeQuery = true)
    public int resetMaxClicks( @Param("shortCode") String shortCode, @Param("userId") Long userId);
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE url_schema.url SET password = :urlPassword , is_password_protected = true WHERE short_url = :shortCode AND user_id = :userId", nativeQuery = true)
    public int setUrlPassword(@Param("shortCode") String shortCode, @Param("urlPassword") String urlPassword ,@Param("userId") Long userId);
    
    
    @Modifying
    @Transactional
    @Query(value = "UPDATE url_schema.url SET password = NULL , is_password_protected = false WHERE short_url = :shortCode AND user_id = :userId", nativeQuery = true)
    public int resetUrlPassword( @Param("shortCode") String shortCode, @Param("userId") Long userId);

}
