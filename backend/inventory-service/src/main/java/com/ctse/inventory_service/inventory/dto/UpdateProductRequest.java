package com.ctse.inventory_service.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record UpdateProductRequest(
        @NotBlank String productName,
        @NotNull @Min(0) Integer stockQuantity,
        @NotNull @DecimalMin(value = "0.00") BigDecimal price
) {
}
