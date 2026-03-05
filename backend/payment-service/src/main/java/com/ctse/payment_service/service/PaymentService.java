package com.ctse.payment_service.service;

import com.ctse.payment_service.client.OrderClient;
import com.ctse.payment_service.dto.PaymentRequest;
import com.ctse.payment_service.dto.PaymentResponse;
import com.ctse.payment_service.model.Payment;
import com.ctse.payment_service.repo.PaymentRepo;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

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
        p.setPaymentStatus("SUCCESS"); // for demo keep success always
        p = paymentRepo.save(p);

        // 2) Call Order Service to mark PAID (optional - don't fail if service is down)
        try {
            orderClient.updateOrderStatusPaid(req.getOrderId());
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
}