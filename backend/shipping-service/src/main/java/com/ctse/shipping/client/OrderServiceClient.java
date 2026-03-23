package com.ctse.shipping.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.ctse.shipping.dto.OrderDetailsResponse;

@FeignClient(name = "order-service-client", url = "${order.service.url:http://localhost:8081}")
public interface OrderServiceClient {

    @GetMapping("/orders/{orderId}")
    OrderDetailsResponse getOrderById(@PathVariable("orderId") Long orderId);

    @PutMapping("/orders/update-status/{orderId}")
    void updateOrderStatus(@PathVariable("orderId") Long orderId,
                           @RequestParam("status") String status);
}
