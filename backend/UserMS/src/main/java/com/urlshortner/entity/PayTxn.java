package com.urlshortner.entity;

import com.urlshortner.payment.PayGateway;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Table(name = "payment_transactions", schema = "user_schema", uniqueConstraints = {
        @UniqueConstraint(name = "uk_payment_receipt", columnNames = "receipt"),
        @UniqueConstraint(name = "uk_payment_gateway_order", columnNames = "gateway_order_id"),
        @UniqueConstraint(name = "uk_payment_gateway_payment", columnNames = "gateway_payment_id"),
        @UniqueConstraint(name = "uk_payment_webhook_event", columnNames = "webhook_event_id")
})
public class PayTxn {
    public enum Status { CREATING, CREATED, PAID, FAILED }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PayGateway.Type gateway;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @Column(nullable = false, length = 40)
    private String receipt;
    @Column(name = "gateway_order_id")
    private String gatewayOrderId;
    @Column(name = "gateway_payment_id")
    private String gatewayPaymentId;
    @Column(name = "webhook_event_id")
    private String webhookEventId;
    @Column(nullable = false)
    private long amount;
    @Column(nullable = false, length = 3)
    private String currency;
    @Column(length = 500)
    private String failureReason;
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
    private LocalDateTime paidAt;
    @Version
    private long version;

    @PreUpdate
    void touch() {
        updatedAt = LocalDateTime.now();
    }
}
