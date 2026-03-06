package com.ctse.inventory_service.inventory.exception;

public class ProductNotFoundException extends RuntimeException {
    public ProductNotFoundException(Integer productId) {
        super("Product not found: " + productId);
    }
}
