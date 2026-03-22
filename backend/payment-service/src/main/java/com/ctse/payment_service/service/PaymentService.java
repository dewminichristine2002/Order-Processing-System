package com.ctse.payment_service.service;

import org.springframework.stereotype.Service;

import com.ctse.payment_service.client.OrderClient;
import com.ctse.payment_service.dto.PaymentRequest;
import com.ctse.payment_service.dto.PaymentResponse;
import com.ctse.payment_service.model.Payment;
import com.ctse.payment_service.repo.PaymentRepo;

@Service
public class PaymentService {

    private static final String PAID = "PAID";
    private static final String PENDING = "PENDING";

    private final PaymentRepo paymentRepo;
    private final OrderClient orderClient;

    public PaymentService(PaymentRepo paymentRepo, OrderClient orderClient) {
        this.paymentRepo = paymentRepo;
        this.orderClient = orderClient;
    }

    public PaymentResponse processPayment(PaymentRequest req) {
        // 1) Save payment
        Payment p = new Payment();
        p.setOrderId(req.getOrderId());
        p.setAmount(req.getAmount());
        p.setPaymentMethod(req.getPaymentMethod());
        
        // Set status: Cash is PAID immediately, Bank Transfer and Cheque need verification
        if ("Cash".equalsIgnoreCase(req.getPaymentMethod())) {
            p.setPaymentStatus(PAID);
        } else {
            p.setPaymentStatus(PENDING);
        }
        
        p = paymentRepo.save(p);

        // 2) Call Order Service to mirror payment outcome in order status.
        try {
            orderClient.updateOrderStatus(req.getOrderId(), p.getPaymentStatus());
        } catch (Exception e) {
            // Log but continue - payment is already saved
            System.err.println("Warning: Could not update order status - " + e.getMessage());
        }

        // 3) Response
        PaymentResponse res = new PaymentResponse();
        res.setPaymentId(p.getPaymentId());
        res.setOrderId(p.getOrderId());
        res.setAmount(p.getAmount());
        res.setPaymentMethod(p.getPaymentMethod());
        res.setPaymentStatus(p.getPaymentStatus());
        res.setPaymentDate(p.getPaymentDate());
        return res;
    }

    public PaymentResponse confirmPayment(Long paymentId) {
        Payment p = paymentRepo.findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found with id: " + paymentId));
        
        // Update status to PAID
        p.setPaymentStatus(PAID);
        p = paymentRepo.save(p);
        
        // Try to update order service
        try {
            orderClient.updateOrderStatusPaid(p.getOrderId());
        } catch (Exception e) {
            System.err.println("Warning: Could not update order status - " + e.getMessage());
        }
        
        // Return response
        PaymentResponse res = new PaymentResponse();
        res.setPaymentId(p.getPaymentId());
        res.setOrderId(p.getOrderId());
        res.setAmount(p.getAmount());
        res.setPaymentMethod(p.getPaymentMethod());
        res.setPaymentStatus(p.getPaymentStatus());
        res.setPaymentDate(p.getPaymentDate());
        return res;
    }
}