package com.ecommerce.controller;

import com.ecommerce.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/reviews")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminReviewController {

    private final ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<ReviewDto>> getAllReviews() {
        var reviews = reviewRepository.findAll().stream()
                .map(review -> new ReviewDto(
                        review.getReviewId(),
                        review.getProduct().getName(),
                        review.getUser().getEmail(),
                        review.getRating(),
                        review.getComment(),
                        review.getStatus() == null ? "PENDING" : review.getStatus(),
                        review.getCreatedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(reviews);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ReviewDto> updateStatus(@PathVariable Integer id, @RequestParam String status) {
        return reviewRepository.findById(id)
                .map(review -> {
                    review.setStatus(status);
                    reviewRepository.save(review);
                    return ResponseEntity.ok(new ReviewDto(
                            review.getReviewId(),
                            review.getProduct().getName(),
                            review.getUser().getEmail(),
                            review.getRating(),
                            review.getComment(),
                            review.getStatus(),
                            review.getCreatedAt()
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReview(@PathVariable Integer id) {
        reviewRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    public record ReviewDto(
            Integer reviewId,
            String productName,
            String clientEmail,
            Integer rating,
            String comment,
            String status,
            java.time.LocalDateTime createdAt
    ) {}
}
