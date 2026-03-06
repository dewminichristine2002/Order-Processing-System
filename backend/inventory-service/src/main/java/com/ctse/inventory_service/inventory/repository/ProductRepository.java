package com.ctse.inventory_service.inventory.repository;

import com.ctse.inventory_service.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {
}
