package com.ctse.shipping.dto;

import jakarta.validation.constraints.NotBlank;

public class ShipmentStatusUpdateRequest {
    @NotBlank
    private String shipmentStatus;

    public String getShipmentStatus() {
        return shipmentStatus;
    }

    public void setShipmentStatus(String shipmentStatus) {
        this.shipmentStatus = shipmentStatus;
    }
}
