package com.ctse.shipping.controller;

import com.ctse.shipping.dto.ShipmentCreateRequest;
import com.ctse.shipping.dto.ShipmentResponse;
import com.ctse.shipping.dto.ShipmentStatusUpdateRequest;
import com.ctse.shipping.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/shipping")
@RequiredArgsConstructor
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping("/create")
    @ResponseStatus(HttpStatus.CREATED)
    public ShipmentResponse createShipment(@Valid @RequestBody ShipmentCreateRequest request) {
        return shipmentService.createShipment(request);
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
}
