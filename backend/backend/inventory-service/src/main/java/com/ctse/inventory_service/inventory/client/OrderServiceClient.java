package com.ctse.inventory_service.inventory.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "inventory-order-service-client", url = "${order.service.url:http://localhost:8080}")
public interface OrderServiceClient {

    @PutMapping("/orders/update-status/{orderId}")
    void updateOrderStatus(@PathVariable("orderId") Long orderId,
                           @RequestParam("status") String status);
}
