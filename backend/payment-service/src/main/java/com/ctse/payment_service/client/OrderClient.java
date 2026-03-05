package com.ctse.payment_service.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class OrderClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.orderBaseUrl}")
    private String orderBaseUrl;

    @Value("${app.internalApiKey}")
    private String internalApiKey;

    public void updateOrderStatusPaid(Long orderId) {
        String url = orderBaseUrl + "/orders/" + orderId + "/status?value=PAID";

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-INTERNAL-API-KEY", internalApiKey);

        HttpEntity<Void> entity = new HttpEntity<>(headers);
        restTemplate.exchange(url, HttpMethod.PUT, entity, Void.class);
    }
}