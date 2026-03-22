package com.ctse.inventory_service.inventory.dto;

import java.time.Instant;

public record StockUpdateResponse(
        Long id,
        Integer productId,
        Integer previousQuantity,
        Integer newQuantity,
        Integer changeAmount,
        String reason,
        String referenceId,
        Instant createdAt
) {
}
