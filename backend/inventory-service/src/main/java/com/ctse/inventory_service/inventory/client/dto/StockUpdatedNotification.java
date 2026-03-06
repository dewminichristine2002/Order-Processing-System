package com.ctse.inventory_service.inventory.client.dto;

import java.time.Instant;

public record StockUpdatedNotification(
        Integer productId,
        Integer newStockQuantity,
        Integer changeAmount,
        String reason,
        String referenceId,
        Instant occurredAt
) {
}
