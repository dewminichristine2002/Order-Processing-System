package com.ctse.shipping.client;

import com.ctse.shipping.dto.OrderStatusUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "order-service-client", url = "${order.service.url:http://localhost:8081}")
public interface OrderServiceClient {

    @PutMapping("/orders/update-status/{orderId}")
    void updateOrderStatus(@PathVariable("orderId") Long orderId,
                           @RequestBody OrderStatusUpdateRequest request);
}
