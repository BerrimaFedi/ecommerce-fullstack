package com.ecommerce.controller;

import com.ecommerce.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/reviews")
@RequiredArgsConstructor
public class PublicReviewController {

    private final ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<ReviewController.ReviewDto>> latestApproved(@RequestParam(defaultValue = "3") int limit) {
        var dtos = reviewRepository.findAll().stream()
                .filter(r -> "APPROVED".equals(r.getStatus()))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(limit)
                .map(r -> new ReviewController.ReviewDto(
                        r.getReviewId(),
                        r.getProduct().getName(),
                        r.getUser().getFirstName() + " " + r.getUser().getLastName(),
                        r.getRating(),
                        r.getComment(),
                        r.getStatus(),
                        r.getCreatedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }
}
