package com.ctse.payment_service.repo;

import com.ctse.payment_service.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepo extends JpaRepository<Payment, Long> {
    Optional<Payment> findTopByOrderIdOrderByPaymentIdDesc(Long orderId);
}