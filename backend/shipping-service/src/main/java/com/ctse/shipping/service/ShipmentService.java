package com.ctse.shipping.service;

import com.ctse.shipping.client.OrderServiceClient;
import com.ctse.shipping.dto.OrderStatusUpdateRequest;
import com.ctse.shipping.dto.ShipmentCreateRequest;
import com.ctse.shipping.dto.ShipmentResponse;
import com.ctse.shipping.dto.ShipmentStatusUpdateRequest;
import com.ctse.shipping.model.Shipment;
import com.ctse.shipping.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class ShipmentService {

    private static final String SHIPPED = "SHIPPED";
    private static final String DELIVERED = "DELIVERED";

    private final ShipmentRepository shipmentRepository;
    private final OrderServiceClient orderServiceClient;

    @Value("${order.service.integration.enabled:false}")
    private boolean orderServiceIntegrationEnabled;

    @Transactional
    public ShipmentResponse createShipment(ShipmentCreateRequest request) {
        Shipment shipment = new Shipment();
        shipment.setOrderId(request.getOrderId());
        shipment.setDeliveryAddress(request.getDeliveryAddress());
        shipment.setShipmentDate(LocalDateTime.now());
        shipment.setShipmentStatus(normalizeStatus(request.getShipmentStatus(), SHIPPED));

        Shipment savedShipment = shipmentRepository.save(shipment);
        notifyOrderServiceIfDelivered(savedShipment);
        return toResponse(savedShipment);
    }

    @Transactional(readOnly = true)
    public ShipmentResponse getShipmentByOrderId(Long orderId) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found for orderId: " + orderId));
        return toResponse(shipment);
    }

    @Transactional(readOnly = true)
    public List<ShipmentResponse> getAllShipments() {
        return shipmentRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ShipmentResponse updateShipmentStatus(Long shipmentId, ShipmentStatusUpdateRequest request) {
        Shipment shipment = shipmentRepository.findById(shipmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found for id: " + shipmentId));

        shipment.setShipmentStatus(normalizeStatus(request.getShipmentStatus(), SHIPPED));
        Shipment updatedShipment = shipmentRepository.save(shipment);
        notifyOrderServiceIfDelivered(updatedShipment);

        return toResponse(updatedShipment);
    }

    private void notifyOrderServiceIfDelivered(Shipment shipment) {
        if (!orderServiceIntegrationEnabled) {
            return;
        }

        if (DELIVERED.equalsIgnoreCase(shipment.getShipmentStatus())) {
            try {
                orderServiceClient.updateOrderStatus(shipment.getOrderId(), new OrderStatusUpdateRequest(DELIVERED));
            } catch (Exception exception) {
                log.warn("Shipment saved, but failed to update Order Service for orderId={}", shipment.getOrderId(), exception);
            }
        }
    }

    private String normalizeStatus(String shipmentStatus, String defaultStatus) {
        if (shipmentStatus == null || shipmentStatus.isBlank()) {
            return defaultStatus;
        }
        return shipmentStatus.trim().toUpperCase();
    }

    private ShipmentResponse toResponse(Shipment shipment) {
        return ShipmentResponse.builder()
                .shipmentId(shipment.getShipmentId())
                .orderId(shipment.getOrderId())
                .deliveryAddress(shipment.getDeliveryAddress())
                .shipmentStatus(shipment.getShipmentStatus())
                .shipmentDate(shipment.getShipmentDate())
                .build();
    }
}
