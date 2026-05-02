package com.ctse.inventory_service.inventory.controller;

import com.ctse.inventory_service.inventory.dto.CreateProductRequest;
import com.ctse.inventory_service.inventory.dto.IncreaseStockRequest;
import com.ctse.inventory_service.inventory.dto.ProductResponse;
import com.ctse.inventory_service.inventory.dto.ReduceStockRequest;
import com.ctse.inventory_service.inventory.dto.StockUpdateResponse;
import com.ctse.inventory_service.inventory.dto.UpdateProductRequest;
import com.ctse.inventory_service.inventory.entity.Product;
import com.ctse.inventory_service.inventory.entity.StockUpdate;
import com.ctse.inventory_service.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<ProductResponse> getAllProducts() {
        return inventoryService.getAllProducts().stream()
                .map(InventoryController::toProductResponse)
                .toList();
    }

    @GetMapping("/{productId}")
    public ProductResponse getProduct(@PathVariable Integer productId) {
        return toProductResponse(inventoryService.getProduct(productId));
    }

    @PostMapping("/products")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(@Valid @RequestBody CreateProductRequest request) {
        return toProductResponse(inventoryService.createProduct(request));
    }

    @PutMapping("/products/{productId}")
    public ProductResponse updateProduct(
            @PathVariable Integer productId,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        return toProductResponse(inventoryService.updateProduct(productId, request));
    }

    @DeleteMapping("/products/{productId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable Integer productId) {
        inventoryService.deleteProduct(productId);
    }

    @PutMapping("/reduce-stock/{productId}")
    public StockUpdateResponse reduceStock(
            @PathVariable Integer productId,
            @Valid @RequestBody ReduceStockRequest request
    ) {
        return toStockUpdateResponse(inventoryService.reduceStock(productId, request));
    }

    @PutMapping("/increase-stock/{productId}")
    public StockUpdateResponse increaseStock(
            @PathVariable Integer productId,
            @Valid @RequestBody IncreaseStockRequest request
    ) {
        return toStockUpdateResponse(inventoryService.increaseStock(productId, request));
    }

    /**
     * Optional helper endpoint for tracking stock updates.
     */
    @GetMapping("/stock-updates")
    public Page<StockUpdateResponse> getStockUpdates(
            @RequestParam(required = false) Integer productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 200));
        return inventoryService.getStockUpdates(productId, pageable)
                .map(InventoryController::toStockUpdateResponse);
    }

        @GetMapping("/stock-updates/all")
        public List<StockUpdateResponse> getAllStockUpdates(
            @RequestParam(required = false) Integer productId
        ) {
        return inventoryService.getAllStockUpdates(productId).stream()
            .map(InventoryController::toStockUpdateResponse)
            .toList();
        }

    private static ProductResponse toProductResponse(Product product) {
        return new ProductResponse(
                product.getProductId(),
                product.getProductName(),
                product.getImageUrl(),
                product.getStockQuantity(),
                product.getPrice()
        );
    }

    private static StockUpdateResponse toStockUpdateResponse(StockUpdate update) {
        return new StockUpdateResponse(
                update.getId(),
                update.getProductId(),
                update.getPreviousQuantity(),
                update.getNewQuantity(),
                update.getChangeAmount(),
                update.getReason(),
                update.getReferenceId(),
                update.getCreatedAt()
        );
    }
}
