package com.urlshortner.service;

import com.urlshortner.entity.PayTxn;
import com.urlshortner.entity.Users;
import com.urlshortner.enums.Subscription;
import com.urlshortner.payment.PayGateway;
import com.urlshortner.repository.PayRepo;
import com.urlshortner.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
public class PayService {
    private final PayRepo payments;
    private final UserRepository users;
    private final Map<PayGateway.Type, PayGateway> gateways = new EnumMap<>(PayGateway.Type.class);
    private final long amount;
    private final String currency;

    public PayService(PayRepo payments, UserRepository users, List<PayGateway> gateways,
                      @Value("${payments.premium.amount:200}") long amount,
                      @Value("${payments.premium.currency:INR}") String currency) {
        this.payments = payments;
        this.users = users;
        gateways.forEach(gateway -> this.gateways.put(gateway.type(), gateway));
        this.amount = amount;
        this.currency = currency.toUpperCase(Locale.ROOT);
    }

    @Transactional(noRollbackFor = ResponseStatusException.class)
    public PayTxn create(Long userId, PayGateway.Type type) {
        PayGateway gateway = gateway(type);
        Users user = users.findByIdForUpdate(userId)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "User not found"));
        if (user.getSubscription() == Subscription.PREMIUM) {
            throw error(HttpStatus.CONFLICT, "User already has premium access");
        }

        var existing = payments.findFirstByUserIdAndGatewayAndStatusOrderByCreatedAtDesc(
                userId, type, PayTxn.Status.CREATED);
        if (existing.isPresent()) {
            return existing.get();
        }

        PayTxn txn = new PayTxn();
        txn.setUser(user);
        txn.setGateway(type);
        txn.setStatus(PayTxn.Status.CREATING);
        txn.setReceipt("premium_" + UUID.randomUUID().toString().replace("-", ""));
        txn.setAmount(amount);
        txn.setCurrency(currency);
        payments.save(txn);

        try {
            PayGateway.Order order = gateway.create(
                    new PayGateway.OrderReq(amount, currency, txn.getReceipt(), userId));
            txn.setGatewayOrderId(order.id());
            txn.setStatus(PayTxn.Status.CREATED);
            return payments.save(txn);
        } catch (ResponseStatusException ex) {
            txn.setStatus(PayTxn.Status.FAILED);
            txn.setFailureReason(shorten(ex.getReason()));
            payments.save(txn);
            throw ex;
        } catch (RuntimeException ex) {
            txn.setStatus(PayTxn.Status.FAILED);
            txn.setFailureReason(shorten(ex.getMessage()));
            payments.save(txn);
            throw error(HttpStatus.BAD_GATEWAY, "Payment gateway order creation failed", ex);
        }
    }

    @Transactional(readOnly = true)
    public PayTxn status(Long userId, Long txnId) {
        PayTxn txn = payments.findById(txnId)
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Payment transaction not found"));
        if (!txn.getUser().getId().equals(userId)) {
            throw error(HttpStatus.NOT_FOUND, "Payment transaction not found");
        }
        return txn;
    }

    @Transactional
    public String webhook(String body, String signature, String eventId) {
        PayGateway.Event event = gateway(PayGateway.Type.RAZORPAY).webhook(body, signature, eventId);
        if (payments.existsByWebhookEventId(event.id())) {
            return "duplicate";
        }
        if (!event.paid()) {
            return "ignored";
        }

        PayTxn txn = payments.findOrderForUpdate(PayGateway.Type.RAZORPAY, event.orderId())
                .orElseThrow(() -> error(HttpStatus.NOT_FOUND, "Payment order not found"));
        if (txn.getStatus() == PayTxn.Status.PAID) {
            return "duplicate";
        }
        if (txn.getStatus() != PayTxn.Status.CREATED) {
            throw error(HttpStatus.CONFLICT, "Payment order is not payable");
        }
        if (txn.getAmount() != event.amount() || !txn.getCurrency().equalsIgnoreCase(event.currency())) {
            throw error(HttpStatus.BAD_REQUEST, "Webhook amount or currency does not match the payment order");
        }

        txn.setGatewayPaymentId(event.paymentId());
        txn.setWebhookEventId(event.id());
        txn.setStatus(PayTxn.Status.PAID);
        txn.setPaidAt(LocalDateTime.now());
        txn.getUser().setSubscription(Subscription.PREMIUM);
        users.save(txn.getUser());
        payments.save(txn);
        return "processed";
    }

    public String checkoutKey(PayGateway.Type type) {
        return gateway(type).checkoutKey();
    }

    private PayGateway gateway(PayGateway.Type type) {
        PayGateway gateway = gateways.get(type);
        if (gateway == null) {
            throw error(HttpStatus.BAD_REQUEST, "Unsupported payment gateway: " + type);
        }
        return gateway;
    }

    private String shorten(String message) {
        return message == null || message.length() <= 500 ? message : message.substring(0, 500);
    }

    private ResponseStatusException error(HttpStatus status, String message) {
        return new ResponseStatusException(status, message);
    }

    private ResponseStatusException error(HttpStatus status, String message, Throwable cause) {
        return new ResponseStatusException(status, message, cause);
    }
}
