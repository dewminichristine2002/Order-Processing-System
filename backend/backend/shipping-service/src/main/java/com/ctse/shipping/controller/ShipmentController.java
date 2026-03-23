package com.ctse.shipping.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ctse.shipping.dto.DeliveryPersonAssignmentRequest;
import com.ctse.shipping.dto.ShipmentCreateRequest;
import com.ctse.shipping.dto.OrderDetailsResponse;
import com.ctse.shipping.dto.ShipmentResponse;
import com.ctse.shipping.dto.ShipmentStatusUpdateRequest;
import com.ctse.shipping.service.ShipmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/shipping")
public class ShipmentController {

    private final ShipmentService shipmentService;

    public ShipmentController(ShipmentService shipmentService) {
        this.shipmentService = shipmentService;
    }

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public ShipmentResponse createShipment(@Valid @RequestBody ShipmentCreateRequest request) {
        return shipmentService.createShipment(request);
    }

    @PostMapping("/from-order/{orderId}")
    @ResponseStatus(HttpStatus.CREATED)
    public ShipmentResponse createShipmentFromOrder(@PathVariable Long orderId) {
        return shipmentService.createShipmentFromOrder(orderId);
    }

    @GetMapping("/order-details/{orderId}")
    public OrderDetailsResponse getOrderDetails(@PathVariable Long orderId) {
        return shipmentService.getOrderDetails(orderId);
    }

    @GetMapping("/{orderId}")
    public ShipmentResponse getShipmentByOrderId(@PathVariable Long orderId) {
        return shipmentService.getShipmentByOrderId(orderId);
    }

    @GetMapping
    public List<ShipmentResponse> getAllShipments() {
        return shipmentService.getAllShipments();
    }

    @PutMapping("/update-status/{id}")
    public ShipmentResponse updateShipmentStatus(@PathVariable("id") Long shipmentId,
                                                 @Valid @RequestBody ShipmentStatusUpdateRequest request) {
        return shipmentService.updateShipmentStatus(shipmentId, request);
    }

    @PutMapping("/update-status/order/{orderId}")
    public ShipmentResponse updateShipmentStatusByOrderId(@PathVariable Long orderId,
                                                          @Valid @RequestBody ShipmentStatusUpdateRequest request) {
        return shipmentService.updateShipmentStatusByOrderId(orderId, request);
    }

    @PutMapping("/assign-delivery/order/{orderId}")
    public ShipmentResponse assignDeliveryPersonByOrderId(@PathVariable Long orderId,
                                                          @Valid @RequestBody DeliveryPersonAssignmentRequest request) {
        return shipmentService.assignDeliveryPersonByOrderId(orderId, request);
    }
}
