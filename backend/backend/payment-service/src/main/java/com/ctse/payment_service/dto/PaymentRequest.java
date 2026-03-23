package com.ctse.payment_service.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class PaymentRequest {

    @NotNull
    @Positive
    private Long orderId;

    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    @Digits(integer = 8, fraction = 2)
    private BigDecimal amount;

    /**
     * Valid values: Cash, BANK_TRANSFER, CHEQUE
     * Size-capped to prevent oversized payload injection.
     */
    @NotBlank
    @Size(min = 2, max = 50, message = "paymentMethod must be between 2 and 50 characters")
    private String paymentMethod; // Cash / BANK_TRANSFER / CHEQUE

    // getters & setters
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}