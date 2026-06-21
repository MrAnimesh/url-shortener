package com.urlshortner.payment;

public interface PayGateway {
    enum Type { RAZORPAY }

    record OrderReq(long amount, String currency, String receipt, Long userId) {}

    record Order(String id, String checkoutKey) {}

    record Event(String id, String type, String orderId, String paymentId,
                 Long amount, String currency) {
        public boolean paid() {
            return "order.paid".equals(type);
        }
    }

    Type type();

    Order create(OrderReq request);

    Event webhook(String body, String signature, String eventId);

    String checkoutKey();
}
