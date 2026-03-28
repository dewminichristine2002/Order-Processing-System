package com.ctse.inventory_service.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateProductRequest(
        @NotNull Integer productId,
        @NotBlank String productName,
        String imageUrl,
        @NotNull @Min(0) Integer stockQuantity,
        @NotNull @DecimalMin("0.00") BigDecimal price
) {
}
