package com.ctse.inventory_service.inventory.client;

import com.ctse.inventory_service.inventory.client.dto.StockUpdatedNotification;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "orderServiceClient",
        url = "${inventory.order-service.base-url}",
        path = "${inventory.order-service.notify-path}"
)
public interface OrderServiceClient {

    @PostMapping
    void notifyStockUpdated(@RequestBody StockUpdatedNotification notification);
}
