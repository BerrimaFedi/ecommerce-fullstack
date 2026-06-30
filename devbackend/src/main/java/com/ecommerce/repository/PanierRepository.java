package com.ecommerce.repository;

import com.ecommerce.entity.Panier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PanierRepository extends JpaRepository<Panier, Integer> {
    Optional<Panier> findByUser_UserId(Integer userId);
}
