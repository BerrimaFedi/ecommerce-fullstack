package com.ecommerce.repository;

import com.ecommerce.entity.CommandeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommandeItemRepository extends JpaRepository<CommandeItem, Integer> {
    List<CommandeItem> findByCommande_CommandeId(Integer commandeId);
}
