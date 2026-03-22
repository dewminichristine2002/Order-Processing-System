package com.ctse.inventory_service.inventory.service;

import com.ctse.inventory_service.inventory.client.OrderServiceClient;
import com.ctse.inventory_service.inventory.client.dto.StockUpdatedNotification;
import com.ctse.inventory_service.inventory.dto.CreateProductRequest;
import com.ctse.inventory_service.inventory.dto.ReduceStockRequest;
import com.ctse.inventory_service.inventory.dto.UpdateProductRequest;
import com.ctse.inventory_service.inventory.entity.Product;
import com.ctse.inventory_service.inventory.entity.StockUpdate;
import com.ctse.inventory_service.inventory.exception.InsufficientStockException;
import com.ctse.inventory_service.inventory.exception.ProductNotFoundException;
import com.ctse.inventory_service.inventory.repository.ProductRepository;
import com.ctse.inventory_service.inventory.repository.StockUpdateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryService.class);

    private final ProductRepository productRepository;
    private final StockUpdateRepository stockUpdateRepository;
    private final OrderServiceClient orderServiceClient;

    private final boolean notifyEnabled;

    public InventoryService(
            ProductRepository productRepository,
            StockUpdateRepository stockUpdateRepository,
            OrderServiceClient orderServiceClient,
            @Value("${inventory.order-service.notify-enabled:false}") boolean notifyEnabled
    ) {
        this.productRepository = productRepository;
        this.stockUpdateRepository = stockUpdateRepository;
        this.orderServiceClient = orderServiceClient;
        this.notifyEnabled = notifyEnabled;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProduct(Integer productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));
    }

    @Transactional
    public Product createProduct(CreateProductRequest request) {
        if (productRepository.existsById(request.productId())) {
            throw new IllegalArgumentException("Product already exists: " + request.productId());
        }

        Product product = new Product();
        product.setProductId(request.productId());
        product.setProductName(request.productName());
        product.setStockQuantity(request.stockQuantity());
        product.setPrice(request.price());
        return productRepository.save(product);
    }

    @Transactional
    public StockUpdate reduceStock(Integer productId, ReduceStockRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        int previousQty = product.getStockQuantity();
        int requestedQty = request.quantity();
        if (previousQty < requestedQty) {
            throw new InsufficientStockException(productId, previousQty, requestedQty);
        }

        int newQty = previousQty - requestedQty;
        product.setStockQuantity(newQty);
        productRepository.save(product);

        StockUpdate update = new StockUpdate();
        update.setProductId(productId);
        update.setPreviousQuantity(previousQty);
        update.setNewQuantity(newQty);
        update.setChangeAmount(-requestedQty);
        update.setReason("REDUCE_STOCK");
        update.setReferenceId(request.orderId());
        update.setCreatedAt(Instant.now());
        StockUpdate saved = stockUpdateRepository.save(update);

        notifyOrderService(saved);
        return saved;
    }

    @Transactional
    public Product updateProduct(Integer productId, UpdateProductRequest request) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

        int previousQty = product.getStockQuantity();
        int newQty = request.stockQuantity();
        if (previousQty != newQty) {
            StockUpdate update = new StockUpdate();
            update.setProductId(productId);
            update.setPreviousQuantity(previousQty);
            update.setNewQuantity(newQty);
            update.setChangeAmount(newQty - previousQty);
            update.setReason("ADMIN_SET_STOCK");
            update.setReferenceId("ADMIN");
            update.setCreatedAt(Instant.now());
            stockUpdateRepository.save(update);
        }

        product.setProductName(request.productName());
        product.setStockQuantity(newQty);
        product.setPrice(request.price());
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(Integer productId) {
        if (!productRepository.existsById(productId)) {
            throw new ProductNotFoundException(productId);
        }
        stockUpdateRepository.deleteByProductId(productId);
        productRepository.deleteById(productId);
    }

    public Page<StockUpdate> getStockUpdates(Integer productId, Pageable pageable) {
        if (productId == null) {
            return stockUpdateRepository.findAll(pageable);
        }
        return stockUpdateRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable);
    }

    private void notifyOrderService(StockUpdate update) {
        if (!notifyEnabled) {
            return;
        }
        try {
            orderServiceClient.notifyStockUpdated(new StockUpdatedNotification(
                    update.getProductId(),
                    update.getNewQuantity(),
                    update.getChangeAmount(),
                    update.getReason(),
                    update.getReferenceId(),
                    update.getCreatedAt()
            ));
        } catch (Exception ex) {
            log.warn("Order service notification failed (continuing): {}", ex.getMessage());
        }
    }
}
