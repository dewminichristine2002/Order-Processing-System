package com.ctse.shipping.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "shipments")
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long shipmentId;

    private Long orderId;

    private String deliveryAddress;

    private String shipmentStatus;

    private LocalDateTime shipmentDate;
}