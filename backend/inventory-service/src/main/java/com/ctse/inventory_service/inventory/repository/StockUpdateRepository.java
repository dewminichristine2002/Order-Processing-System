package com.ctse.inventory_service.inventory.repository;

import com.ctse.inventory_service.inventory.entity.StockUpdate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockUpdateRepository extends JpaRepository<StockUpdate, Long> {
    Page<StockUpdate> findByProductIdOrderByCreatedAtDesc(Integer productId, Pageable pageable);

    List<StockUpdate> findByProductIdOrderByCreatedAtDesc(Integer productId);

    void deleteByProductId(Integer productId);
}
