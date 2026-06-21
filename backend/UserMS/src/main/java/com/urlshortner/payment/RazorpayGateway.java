package com.urlshortner.payment;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Component
public class RazorpayGateway implements PayGateway {
    private final String keyId;
    private final String hookSecret;
    private final ObjectMapper json;
    private final RazorpayClient client;

    public RazorpayGateway(@Value("${payments.razorpay.key-id}") String keyId,
                           @Value("${payments.razorpay.key-secret}") String keySecret,
                           @Value("${payments.razorpay.webhook-secret}") String hookSecret,
                           ObjectMapper json) throws RazorpayException {
        this.keyId = keyId;
        this.hookSecret = hookSecret;
        this.json = json;
        this.client = new RazorpayClient(keyId, keySecret);
    }

    @Override
    public Type type() {
        return Type.RAZORPAY;
    }

    @Override
    public Order create(OrderReq req) {
        JSONObject data = new JSONObject()
                .put("amount", req.amount())
                .put("currency", req.currency())
                .put("receipt", req.receipt())
                .put("partial_payment", false)
                .put("notes", new JSONObject().put("user_id", req.userId().toString()));
        try {
            com.razorpay.Order order = client.orders.create(data);
            return new Order(order.get("id"), keyId);
        } catch (RazorpayException ex) {
            throw error(HttpStatus.BAD_GATEWAY, "Razorpay order creation failed", ex);
        }
    }

    @Override
    public Event webhook(String body, String signature, String eventId) {
        if (blank(signature) || blank(eventId)) {
            throw error(HttpStatus.BAD_REQUEST, "Missing Razorpay webhook headers");
        }
        if (!validSignature(body, signature)) {
            throw error(HttpStatus.UNAUTHORIZED, "Invalid Razorpay webhook signature");
        }
        try {
            JsonNode root = json.readTree(body);
            String type = text(root, "/event");
            if (!"order.paid".equals(type)) {
                return new Event(eventId, type, null, null, null, null);
            }

            JsonNode order = node(root, "/payload/order/entity");
            JsonNode payment = node(root, "/payload/payment/entity");
            String orderId = text(order, "/id");
            long amount = number(order, "/amount");
            String currency = text(order, "/currency");

            if (!orderId.equals(text(payment, "/order_id"))
                    || amount != number(payment, "/amount")
                    || !currency.equalsIgnoreCase(text(payment, "/currency"))) {
                throw error(HttpStatus.BAD_REQUEST, "Webhook payment does not match its order");
            }
            if (!"paid".equals(text(order, "/status"))
                    || !"captured".equals(text(payment, "/status"))
                    || !node(payment, "/captured").asBoolean(false)) {
                throw error(HttpStatus.BAD_REQUEST, "Webhook payment is not captured");
            }
            return new Event(eventId, type, orderId, text(payment, "/id"), amount, currency);
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw error(HttpStatus.BAD_REQUEST, "Malformed Razorpay webhook payload", ex);
        }
    }

    @Override
    public String checkoutKey() {
        return keyId;
    }

    private boolean validSignature(String body, String signature) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(hookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return MessageDigest.isEqual(mac.doFinal(body.getBytes(StandardCharsets.UTF_8)),
                    HexFormat.of().parseHex(signature));
        } catch (Exception ex) {
            return false;
        }
    }

    private JsonNode node(JsonNode root, String path) {
        JsonNode value = root.at(path);
        if (value.isMissingNode() || value.isNull()) {
            throw error(HttpStatus.BAD_REQUEST, "Missing webhook field: " + path);
        }
        return value;
    }

    private String text(JsonNode root, String path) {
        JsonNode value = node(root, path);
        if (!value.isTextual() || value.textValue().isBlank()) {
            throw error(HttpStatus.BAD_REQUEST, "Invalid webhook field: " + path);
        }
        return value.textValue();
    }

    private long number(JsonNode root, String path) {
        JsonNode value = node(root, path);
        if (!value.canConvertToLong()) {
            throw error(HttpStatus.BAD_REQUEST, "Invalid webhook field: " + path);
        }
        return value.longValue();
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private ResponseStatusException error(HttpStatus status, String message) {
        return new ResponseStatusException(status, message);
    }

    private ResponseStatusException error(HttpStatus status, String message, Throwable cause) {
        return new ResponseStatusException(status, message, cause);
    }
}
