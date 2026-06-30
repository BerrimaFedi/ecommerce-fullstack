package com.ecommerce.controller;

import com.ecommerce.entity.Product;
import com.ecommerce.entity.Review;
import com.ecommerce.entity.User;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<ReviewDto>> getProductReviews(@PathVariable Integer productId) {
        var reviews = reviewRepository.findByProduct_ProductId(productId).stream()
                .filter(r -> "APPROVED".equals(r.getStatus()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(ReviewDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviews);
    }

        @GetMapping
        @PreAuthorize("permitAll()")
        public ResponseEntity<List<ReviewDto>> getApprovedReviews(@RequestParam(defaultValue = "3") int limit) {
        var reviews = reviewRepository.findAll().stream()
                .filter(r -> "APPROVED".equals(r.getStatus()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(limit)
                .map(ReviewDto::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    public ResponseEntity<ReviewDto> submitReview(
            @AuthenticationPrincipal User user,
            @RequestBody CreateReviewRequest request
    ) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = Review.builder()
                .product(product)
                .user(user)
                .rating(request.rating())
                .comment(request.comment())
                .status("PENDING")
                .build();

        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(ReviewDto.from(saved));
    }

    public record CreateReviewRequest(Integer productId, Integer rating, String comment) {}

    public record ReviewDto(
            Integer reviewId,
            String productName,
            String userName,
            Integer rating,
            String comment,
            String status,
            java.time.LocalDateTime createdAt
    ) {
        public static ReviewDto from(Review review) {
            return new ReviewDto(
                    review.getReviewId(),
                    review.getProduct().getName(),
                    review.getUser().getFirstName() + " " + review.getUser().getLastName(),
                    review.getRating(),
                    review.getComment(),
                    review.getStatus(),
                    review.getCreatedAt()
            );
        }
    }
}
