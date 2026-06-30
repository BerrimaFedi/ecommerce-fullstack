package com.ecommerce.repository;

import com.ecommerce.entity.PanierItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PanierItemRepository extends JpaRepository<PanierItem, Integer> {
    List<PanierItem> findByPanier_PanierId(Integer panierId);
}
