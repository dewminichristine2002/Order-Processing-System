package com.sliit.order_service.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.sliit.order_service.model.Order;
import com.sliit.order_service.model.OrderItem;
import com.sliit.order_service.repository.OrderRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WebClient.Builder webClientBuilder;

    @PersistenceContext
    private EntityManager entityManager;

    @Value("${services.inventory.url}")
    private String inventoryUrl;

    @Value("${services.shipping.url}")
    private String shippingUrl;

    // ✅ CREATE ORDER
    public Order createOrder(Order order) {

        double total = 0;

        for (OrderItem item : order.getItems()) {
            double subtotal = item.getPrice() * item.getQuantity();
            item.setSubtotal(subtotal);
            total += subtotal;

            item.setOrder(order); // link both sides
        }

        order.setTotalAmount(total);
        order.setStatus("PENDING");

        Order savedOrder = orderRepository.save(order);

        WebClient webClient = webClientBuilder.build();

        try {
            // Inventory update
            for (OrderItem item : savedOrder.getItems()) {
                String reduceStockUrl = inventoryUrl.endsWith("/")
                        ? inventoryUrl + item.getProductId()
                        : inventoryUrl + "/" + item.getProductId();

                webClient.put()
                    .uri(reduceStockUrl)
                    .bodyValue(Map.of(
                            "quantity", item.getQuantity(),
                            "orderId", String.valueOf(savedOrder.getOrderId())
                    ))
                    .retrieve()
                    .bodyToMono(Void.class)
                    .block();
            }
        } catch (Exception e) {
            System.out.println("Inventory service not available: " + e.getMessage());
        }

        return waitForLatestOrderState(savedOrder);
    }

    private Order waitForLatestOrderState(Order savedOrder) {
        final int maxAttempts = 25;
        final long waitMillis = 200L;

        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            entityManager.clear();
            Optional<Order> current = orderRepository.findById(savedOrder.getOrderId());
            if (current.isPresent() && "PROCESSING".equalsIgnoreCase(current.get().getStatus())) {
                return current.get();
            }

            try {
                Thread.sleep(waitMillis);
            } catch (InterruptedException exception) {
                Thread.currentThread().interrupt();
                break;
            }
        }

        entityManager.clear();
        return orderRepository.findById(savedOrder.getOrderId()).orElse(savedOrder);
    }

    // ✅ GET ORDER
    public Order getOrder(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    // ✅ GET ALL ORDERS
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // ✅ UPDATE STATUS
    public String updateStatus(Long id, String status) {

        Order order = orderRepository.findById(id).orElseThrow();

        order.setStatus(status);
        orderRepository.save(order);

        WebClient webClient = webClientBuilder.build();

        if ("PAID".equalsIgnoreCase(status)) {
            try {
                webClient.post()
                        .uri(shippingUrl + "/" + order.getOrderId())
                        .retrieve()
                        .bodyToMono(Void.class)
                        .block();
            } catch (Exception e) {
                System.out.println("Service call failed: " + e.getMessage());
            }
        }

        return "Order updated to " + status;
    }
}