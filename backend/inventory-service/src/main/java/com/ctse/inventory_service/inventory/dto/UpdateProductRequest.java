package com.ctse.inventory_service.inventory.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateProductRequest(
        @NotBlank String productName,
        String imageUrl,
        Integer stockQuantity,
        @NotNull @DecimalMin(value = "0.00") BigDecimal price
) {
}
