package com.ctse.inventory_service.inventory.dto;

import java.math.BigDecimal;

public record ProductResponse(
        Integer productId,
        String productName,
        String imageUrl,
        Integer stockQuantity,
        BigDecimal price
) {
}
