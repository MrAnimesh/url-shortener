package com.urlshortner.service;

import com.urlshortner.entity.PayTxn;
import com.urlshortner.entity.Users;
import com.urlshortner.enums.Subscription;
import com.urlshortner.payment.PayGateway;
import com.urlshortner.repository.PayRepo;
import com.urlshortner.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayServiceTest {
    @Mock PayRepo repo;
    @Mock UserRepository users;
    @Mock PayGateway gateway;
    PayService service;

    @BeforeEach
    void setUp() {
        lenient().when(gateway.type()).thenReturn(PayGateway.Type.RAZORPAY);
        service = new PayService(repo, users, List.of(gateway), 49900, "INR");
    }

    @Test
    void createsOrderAtServerPrice() {
        Users user = user(Subscription.FREE);
        when(users.findByIdForUpdate(1L)).thenReturn(Optional.of(user));
        when(repo.findFirstByUserIdAndGatewayAndStatusOrderByCreatedAtDesc(
                1L, PayGateway.Type.RAZORPAY, PayTxn.Status.CREATED)).thenReturn(Optional.empty());
        when(repo.save(any())).thenAnswer(call -> {
            PayTxn txn = call.getArgument(0);
            txn.setId(10L);
            return txn;
        });
        when(gateway.create(any())).thenReturn(new PayGateway.Order("order_1", "key"));

        PayTxn txn = service.create(1L, PayGateway.Type.RAZORPAY);

        assertEquals(49900, txn.getAmount());
        assertEquals("INR", txn.getCurrency());
        assertEquals(PayTxn.Status.CREATED, txn.getStatus());
    }

    @Test
    void rejectsPremiumUser() {
        when(users.findByIdForUpdate(1L)).thenReturn(Optional.of(user(Subscription.PREMIUM)));
        assertThrows(ResponseStatusException.class,
                () -> service.create(1L, PayGateway.Type.RAZORPAY));
        verify(gateway, never()).create(any());
    }

    @Test
    void reusesOpenOrder() {
        Users user = user(Subscription.FREE);
        PayTxn existing = txn(user, PayTxn.Status.CREATED);
        existing.setGatewayOrderId("order_existing");
        when(users.findByIdForUpdate(1L)).thenReturn(Optional.of(user));
        when(repo.findFirstByUserIdAndGatewayAndStatusOrderByCreatedAtDesc(
                1L, PayGateway.Type.RAZORPAY, PayTxn.Status.CREATED)).thenReturn(Optional.of(existing));

        assertEquals(existing, service.create(1L, PayGateway.Type.RAZORPAY));
        verify(gateway, never()).create(any());
    }

    @Test
    void grantsPremiumForCapturedWebhook() {
        Users user = user(Subscription.FREE);
        PayTxn txn = txn(user, PayTxn.Status.CREATED);
        PayGateway.Event event = new PayGateway.Event(
                "event_1", "order.paid", "order_1", "pay_1", 49900L, "INR");
        when(gateway.webhook("body", "signature", "event_1")).thenReturn(event);
        when(repo.existsByWebhookEventId("event_1")).thenReturn(false);
        when(repo.findOrderForUpdate(PayGateway.Type.RAZORPAY, "order_1")).thenReturn(Optional.of(txn));

        assertEquals("processed", service.webhook("body", "signature", "event_1"));
        assertEquals(PayTxn.Status.PAID, txn.getStatus());
        assertEquals(Subscription.PREMIUM, user.getSubscription());
        verify(users).save(user);
    }

    @Test
    void duplicateDoesNothing() {
        PayGateway.Event event = new PayGateway.Event(
                "event_1", "order.paid", "order_1", "pay_1", 49900L, "INR");
        when(gateway.webhook("body", "signature", "event_1")).thenReturn(event);
        when(repo.existsByWebhookEventId("event_1")).thenReturn(true);

        assertEquals("duplicate", service.webhook("body", "signature", "event_1"));
        verify(users, never()).save(any());
    }

    @Test
    void mismatchDoesNotGrantPremium() {
        Users user = user(Subscription.FREE);
        PayTxn txn = txn(user, PayTxn.Status.CREATED);
        PayGateway.Event event = new PayGateway.Event(
                "event_1", "order.paid", "order_1", "pay_1", 1L, "INR");
        when(gateway.webhook("body", "signature", "event_1")).thenReturn(event);
        when(repo.findOrderForUpdate(PayGateway.Type.RAZORPAY, "order_1")).thenReturn(Optional.of(txn));

        assertThrows(ResponseStatusException.class,
                () -> service.webhook("body", "signature", "event_1"));
        assertEquals(Subscription.FREE, user.getSubscription());
    }

    @Test
    void recordsGatewayFailure() {
        Users user = user(Subscription.FREE);
        when(users.findByIdForUpdate(1L)).thenReturn(Optional.of(user));
        when(repo.findFirstByUserIdAndGatewayAndStatusOrderByCreatedAtDesc(
                1L, PayGateway.Type.RAZORPAY, PayTxn.Status.CREATED)).thenReturn(Optional.empty());
        when(repo.save(any())).thenAnswer(call -> call.getArgument(0));
        when(gateway.create(any())).thenThrow(new ResponseStatusException(HttpStatus.BAD_GATEWAY));

        assertThrows(ResponseStatusException.class,
                () -> service.create(1L, PayGateway.Type.RAZORPAY));
        assertEquals(Subscription.FREE, user.getSubscription());
        verify(repo, atLeast(2)).save(any());
    }

    private Users user(Subscription subscription) {
        Users user = new Users();
        user.setId(1L);
        user.setSubscription(subscription);
        return user;
    }

    private PayTxn txn(Users user, PayTxn.Status status) {
        PayTxn txn = new PayTxn();
        txn.setUser(user);
        txn.setGateway(PayGateway.Type.RAZORPAY);
        txn.setStatus(status);
        txn.setAmount(49900);
        txn.setCurrency("INR");
        txn.setReceipt("receipt");
        return txn;
    }
}
