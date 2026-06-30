package com.ecommerce.repository;

import com.ecommerce.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByProduct_ProductId(Integer productId);
    List<Review> findByProduct_ProductIdAndStatus(Integer productId, String status);
    List<Review> findByStatusOrderByCreatedAtDesc(String status);
    List<Review> findByUser_UserId(Integer userId);
}
