package com.ctse.shipping.service;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ctse.shipping.client.OrderServiceClient;
import com.ctse.shipping.dto.DeliveryPersonAssignmentRequest;
import com.ctse.shipping.dto.OrderDetailsResponse;
import com.ctse.shipping.dto.ShipmentCreateRequest;
import com.ctse.shipping.dto.ShipmentResponse;
import com.ctse.shipping.dto.ShipmentStatusUpdateRequest;
import com.ctse.shipping.model.Shipment;
import com.ctse.shipping.repository.ShipmentRepository;

@Service
public class ShipmentService {

    private static final Logger log = LoggerFactory.getLogger(ShipmentService.class);

    private static final String SHIPPED = "SHIPPED";
    private static final String DELIVERED = "DELIVERED";
    private static final String PAID = "PAID";

    private final ShipmentRepository shipmentRepository;
    private final OrderServiceClient orderServiceClient;

    public ShipmentService(ShipmentRepository shipmentRepository, OrderServiceClient orderServiceClient) {
        this.shipmentRepository = shipmentRepository;
        this.orderServiceClient = orderServiceClient;
    }

    @Value("${order.service.integration.enabled:false}")
    private boolean orderServiceIntegrationEnabled;

    @Transactional
    public ShipmentResponse createShipment(ShipmentCreateRequest request) {
        ensureShipmentDoesNotExist(request.getOrderId());
        validateOrderStatusForShipmentCreation(getOrderDetails(request.getOrderId()));
        return saveShipment(
                request.getOrderId(),
                request.getCustomerName(),
                request.getContactNumber(),
                request.getDeliveryAddress(),
                request.getEmail(),
                request.getShipmentStatus());
    }

    @Transactional
    public ShipmentResponse createShipmentFromOrder(Long orderId) {
        Shipment existingShipment = shipmentRepository.findByOrderId(orderId).orElse(null);
        if (existingShipment != null) {
            return toResponse(existingShipment);
        }

        OrderDetailsResponse order = getOrderDetails(orderId);
        validateOrderStatusForShipmentCreation(order);

        return saveShipment(
                order.getOrderId(),
                order.getCustomerName(),
                order.getContactNumber(),
                order.getDeliveryAddress(),
                order.getEmail(),
                SHIPPED);
    }

    @Transactional(readOnly = true)
    public OrderDetailsResponse getOrderDetails(Long orderId) {
        try {
            OrderDetailsResponse order = orderServiceClient.getOrderById(orderId);
            if (order == null) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found for id: " + orderId);
            }
            return order;
        } catch (ResponseStatusException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Failed to fetch order details for id: " + orderId,
                    exception);
        }
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

        String normalizedStatus = normalizeStatus(request.getShipmentStatus(), SHIPPED);
        validateOrderStatusForShipmentUpdate(shipment.getOrderId(), normalizedStatus);
        shipment.setShipmentStatus(normalizedStatus);
        Shipment updatedShipment = shipmentRepository.save(shipment);
        notifyOrderServiceIfDelivered(updatedShipment);

        return toResponse(updatedShipment);
    }

    @Transactional
    public ShipmentResponse updateShipmentStatusByOrderId(Long orderId, ShipmentStatusUpdateRequest request) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found for orderId: " + orderId));

        String normalizedStatus = normalizeStatus(request.getShipmentStatus(), SHIPPED);
        validateOrderStatusForShipmentUpdate(orderId, normalizedStatus);
        shipment.setShipmentStatus(normalizedStatus);
        Shipment updatedShipment = shipmentRepository.save(shipment);
        notifyOrderServiceIfDelivered(updatedShipment);

        return toResponse(updatedShipment);
    }

    @Transactional
    public ShipmentResponse assignDeliveryPersonByOrderId(Long orderId, DeliveryPersonAssignmentRequest request) {
        Shipment shipment = shipmentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shipment not found for orderId: " + orderId));

        shipment.setDeliveryPerson(request.getDeliveryPerson().trim());
        Shipment updatedShipment = shipmentRepository.save(shipment);
        return toResponse(updatedShipment);
    }

    private void ensureShipmentDoesNotExist(Long orderId) {
        shipmentRepository.findByOrderId(orderId).ifPresent(existingShipment -> {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Shipment already exists for orderId: " + orderId);
        });
    }

    private void validateOrderStatusForShipmentCreation(OrderDetailsResponse order) {
        String orderStatus = normalizeStatus(order.getStatus(), "");
        if (!PAID.equals(orderStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Shipment can only be created when order status is PAID. Current status: " + order.getStatus());
        }
    }

    private void validateOrderStatusForShipmentUpdate(Long orderId, String shipmentStatus) {
        if (!DELIVERED.equals(shipmentStatus)) {
            return;
        }

        OrderDetailsResponse order = getOrderDetails(orderId);
        String orderStatus = normalizeStatus(order.getStatus(), "");
        if (!PAID.equals(orderStatus) && !SHIPPED.equals(orderStatus) && !DELIVERED.equals(orderStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Shipment can only be marked DELIVERED when order status is PAID, SHIPPED, or DELIVERED. Current status: " + order.getStatus());
        }
    }

    private ShipmentResponse saveShipment(Long orderId,
                                          String customerName,
                                          String contactNumber,
                                          String deliveryAddress,
                                          String email,
                                          String shipmentStatus) {
        Shipment shipment = new Shipment();
        shipment.setOrderId(orderId);
        shipment.setCustomerName(customerName);
        shipment.setContactNumber(contactNumber);
        shipment.setDeliveryAddress(deliveryAddress);
        shipment.setEmail(email);
        LocalDateTime shipmentDate = LocalDateTime.now();
        shipment.setShipmentDate(shipmentDate);
        shipment.setEstimatedDelivery(shipmentDate.plusDays(2));
        shipment.setShipmentStatus(normalizeStatus(shipmentStatus, SHIPPED));

        Shipment savedShipment = shipmentRepository.save(shipment);
        notifyOrderServiceOnShipmentStatus(savedShipment);
        return toResponse(savedShipment);
    }

    private void notifyOrderServiceIfDelivered(Shipment shipment) {
        notifyOrderServiceOnShipmentStatus(shipment);
    }

    private void notifyOrderServiceOnShipmentStatus(Shipment shipment) {
        if (!orderServiceIntegrationEnabled) {
            return;
        }

        String normalizedStatus = normalizeStatus(shipment.getShipmentStatus(), "");
        if (!SHIPPED.equals(normalizedStatus) && !DELIVERED.equals(normalizedStatus)) {
            return;
        }

        try {
            orderServiceClient.updateOrderStatus(shipment.getOrderId(), normalizedStatus);
        } catch (Exception exception) {
            log.warn("Shipment saved, but failed to update Order Service status={} for orderId={}",
                    normalizedStatus,
                    shipment.getOrderId(),
                    exception);
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
                .customerName(shipment.getCustomerName())
                .contactNumber(shipment.getContactNumber())
                .deliveryAddress(shipment.getDeliveryAddress())
                .email(shipment.getEmail())
                .shipmentStatus(shipment.getShipmentStatus())
                .shipmentDate(shipment.getShipmentDate())
                .estimatedDelivery(shipment.getEstimatedDelivery())
                .deliveryPerson(shipment.getDeliveryPerson())
                .build();
    }
}
