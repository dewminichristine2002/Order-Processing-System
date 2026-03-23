package com.sliit.order_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.sliit.order_service.model.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}