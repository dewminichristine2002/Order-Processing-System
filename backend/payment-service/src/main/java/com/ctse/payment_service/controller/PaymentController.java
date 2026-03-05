package com.ctse.payment_service.controller;

import com.ctse.payment_service.dto.PaymentRequest;
import com.ctse.payment_service.dto.PaymentResponse;
import com.ctse.payment_service.repo.PaymentRepo;
import com.ctse.payment_service.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentRepo paymentRepo;

    public PaymentController(PaymentService paymentService, PaymentRepo paymentRepo) {
        this.paymentService = paymentService;
        this.paymentRepo = paymentRepo;
    }

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> process(@Valid @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(paymentService.processPayment(req));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getLatestByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(
            paymentRepo.findTopByOrderIdOrderByPaymentIdDesc(orderId)
                .orElseThrow(() -> new RuntimeException("No payment found for orderId " + orderId))
        );
    }
}