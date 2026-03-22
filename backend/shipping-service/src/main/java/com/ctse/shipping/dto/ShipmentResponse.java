package com.ctse.shipping.dto;

import java.time.LocalDateTime;

public class ShipmentResponse {
    private final Long shipmentId;
    private final Long orderId;
    private final String customerName;
    private final String contactNumber;
    private final String deliveryAddress;
    private final String email;
    private final String shipmentStatus;
    private final LocalDateTime shipmentDate;

    private ShipmentResponse(Builder builder) {
        this.shipmentId = builder.shipmentId;
        this.orderId = builder.orderId;
        this.customerName = builder.customerName;
        this.contactNumber = builder.contactNumber;
        this.deliveryAddress = builder.deliveryAddress;
        this.email = builder.email;
        this.shipmentStatus = builder.shipmentStatus;
        this.shipmentDate = builder.shipmentDate;
    }

    public static Builder builder() {
        return new Builder();
    }

    public Long getShipmentId() {
        return shipmentId;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public String getEmail() {
        return email;
    }

    public String getShipmentStatus() {
        return shipmentStatus;
    }

    public LocalDateTime getShipmentDate() {
        return shipmentDate;
    }

    public static class Builder {
        private Long shipmentId;
        private Long orderId;
        private String customerName;
        private String contactNumber;
        private String deliveryAddress;
        private String email;
        private String shipmentStatus;
        private LocalDateTime shipmentDate;

        public Builder shipmentId(Long shipmentId) {
            this.shipmentId = shipmentId;
            return this;
        }

        public Builder orderId(Long orderId) {
            this.orderId = orderId;
            return this;
        }

        public Builder customerName(String customerName) {
            this.customerName = customerName;
            return this;
        }

        public Builder contactNumber(String contactNumber) {
            this.contactNumber = contactNumber;
            return this;
        }

        public Builder deliveryAddress(String deliveryAddress) {
            this.deliveryAddress = deliveryAddress;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder shipmentStatus(String shipmentStatus) {
            this.shipmentStatus = shipmentStatus;
            return this;
        }

        public Builder shipmentDate(LocalDateTime shipmentDate) {
            this.shipmentDate = shipmentDate;
            return this;
        }

        public ShipmentResponse build() {
            return new ShipmentResponse(this);
        }
    }
}
