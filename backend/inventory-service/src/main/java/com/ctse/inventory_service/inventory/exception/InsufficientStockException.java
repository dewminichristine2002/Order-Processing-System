package com.ctse.inventory_service.inventory.exception;

public class InsufficientStockException extends RuntimeException {
    public InsufficientStockException(Integer productId, int available, int requested) {
        super("Insufficient stock for product " + productId + ": available=" + available + ", requested=" + requested);
    }
}
