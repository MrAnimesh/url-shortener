package com.urlshortner.repository;

import com.urlshortner.entity.PayTxn;
import com.urlshortner.payment.PayGateway;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PayRepo extends JpaRepository<PayTxn, Long> {
    Optional<PayTxn> findFirstByUserIdAndGatewayAndStatusOrderByCreatedAtDesc(
            Long userId, PayGateway.Type gateway, PayTxn.Status status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from PayTxn p join fetch p.user where p.gateway = :gateway and p.gatewayOrderId = :orderId")
    Optional<PayTxn> findOrderForUpdate(@Param("gateway") PayGateway.Type gateway,
                                        @Param("orderId") String orderId);

    boolean existsByWebhookEventId(String eventId);
}
