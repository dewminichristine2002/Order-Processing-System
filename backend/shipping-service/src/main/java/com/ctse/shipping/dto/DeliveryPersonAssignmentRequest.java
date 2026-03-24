package com.ctse.shipping.dto;

import jakarta.validation.constraints.NotBlank;

public class DeliveryPersonAssignmentRequest {

    @NotBlank
    private String deliveryPerson;

    public String getDeliveryPerson() {
        return deliveryPerson;
    }

    public void setDeliveryPerson(String deliveryPerson) {
        this.deliveryPerson = deliveryPerson;
    }
}
