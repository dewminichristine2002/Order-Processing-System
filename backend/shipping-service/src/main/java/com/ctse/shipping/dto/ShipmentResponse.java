package com.ctse.shipping.dto;

import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class ShipmentResponse {
    Long shipmentId;
    Long orderId;
    String deliveryAddress;
    String shipmentStatus;
    LocalDateTime shipmentDate;
}
