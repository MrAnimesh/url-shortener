package com.urlshortner.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.urlshortner.entity.QrDetail;

@Repository
public interface QrDetailRepository extends JpaRepository<QrDetail, Long> {
    Optional<QrDetail> findByUrlIdAndUserId(Long urlId, Long userId);

    void deleteByUrlIdAndUserId(Long urlId, Long userId);
}
