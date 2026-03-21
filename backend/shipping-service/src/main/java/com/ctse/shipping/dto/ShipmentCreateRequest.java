package com.ctse.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ShipmentCreateRequest {
    @NotNull
    private Long orderId;

    @NotBlank
    private String deliveryAddress;

    private String shipmentStatus;
}
