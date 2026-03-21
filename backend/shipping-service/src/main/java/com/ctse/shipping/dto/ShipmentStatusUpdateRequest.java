package com.ctse.shipping.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ShipmentStatusUpdateRequest {
    @NotBlank
    private String shipmentStatus;
}
