package com.urlshortner.payment;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import static org.junit.jupiter.api.Assertions.*;

class RazorpayGatewayTest {
    private static final String SECRET = "test-webhook-secret";
    private final RazorpayGateway gateway;

    RazorpayGatewayTest() throws Exception {
        gateway = new RazorpayGateway("rzp_test_key", "rzp_test_secret", SECRET, new ObjectMapper());
    }

    @Test
    void parsesPaidWebhook() throws Exception {
        String body = """
                {"event":"order.paid","payload":{"order":{"entity":{"id":"order_1","amount":49900,"currency":"INR","status":"paid"}},"payment":{"entity":{"id":"pay_1","order_id":"order_1","amount":49900,"currency":"INR","status":"captured","captured":true}}}}
                """.trim();

        PayGateway.Event event = gateway.webhook(body, sign(body), "event_1");

        assertTrue(event.paid());
        assertEquals("order_1", event.orderId());
        assertEquals("pay_1", event.paymentId());
        assertEquals(49900L, event.amount());
    }

    @Test
    void rejectsBadSignature() {
        assertThrows(ResponseStatusException.class, () -> gateway.webhook("{}", "00", "event_1"));
    }

    @Test
    void ignoresOtherSignedEvents() throws Exception {
        String body = "{\"event\":\"payment.failed\"}";
        assertFalse(gateway.webhook(body, sign(body), "event_2").paid());
    }

    private String sign(String body) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        return HexFormat.of().formatHex(mac.doFinal(body.getBytes(StandardCharsets.UTF_8)));
    }
}
