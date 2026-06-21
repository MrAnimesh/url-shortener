package com.urlshortner.controller;

import com.urlshortner.entity.PayTxn;
import com.urlshortner.enums.Subscription;
import com.urlshortner.payment.PayGateway;
import com.urlshortner.security.UserDetailsImpl;
import com.urlshortner.service.PayService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PayController {
    public record CreateReq(@NotNull PayGateway.Type gateway) {}

    public record OrderRes(Long transactionId, PayGateway.Type gateway, String gatewayOrderId,
                           String checkoutKey, long amount, String currency, PayTxn.Status status) {}

                           // Response used when polling payment status.
    public record StatusRes(Long transactionId, PayGateway.Type gateway, PayTxn.Status status,
                            Subscription subscription) {}

    private final PayService payments;

    public PayController(PayService payments) {
        this.payments = payments;
    }

    @PostMapping("/orders")
    public OrderRes create(@AuthenticationPrincipal UserDetailsImpl user,
                           @RequestBody @Valid CreateReq request) {
        PayTxn txn = payments.create(user.getId(), request.gateway());
        return new OrderRes(txn.getId(), txn.getGateway(), txn.getGatewayOrderId(),
                payments.checkoutKey(txn.getGateway()), txn.getAmount(), txn.getCurrency(), txn.getStatus());
    }

    @GetMapping("/{id}/status")
    public StatusRes status(@AuthenticationPrincipal UserDetailsImpl user, @PathVariable Long id) {
        PayTxn txn = payments.status(user.getId(), id);
        return new StatusRes(txn.getId(), txn.getGateway(), txn.getStatus(),
                txn.getUser().getSubscription());
    }

    @PostMapping("/webhooks/razorpay")
    public ResponseEntity<Map<String, String>> webhook(
            @RequestBody String body,
            @RequestHeader(name = "X-Razorpay-Signature", required = false) String signature,
            @RequestHeader(name = "X-Razorpay-Event-Id", required = false) String eventId) {
        return ResponseEntity.ok(Map.of("status", payments.webhook(body, signature, eventId)));
    }
}
