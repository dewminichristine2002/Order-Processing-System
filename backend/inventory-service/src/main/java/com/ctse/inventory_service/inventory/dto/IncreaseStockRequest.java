package com.ctse.inventory_service.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record IncreaseStockRequest(
        @NotNull @Min(1) Integer quantity,
        String referenceId
) {
}
