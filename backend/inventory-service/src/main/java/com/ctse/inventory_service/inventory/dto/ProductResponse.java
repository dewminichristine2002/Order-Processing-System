package com.ctse.inventory_service.inventory.dto;

import java.math.BigDecimal;

public record ProductResponse(
        Integer productId,
        String productName,
        Integer stockQuantity,
        BigDecimal price
) {
}
