package com.ecommerce.controller;

import com.ecommerce.entity.Commande;
import com.ecommerce.entity.Review;
import com.ecommerce.entity.Role;
import com.ecommerce.entity.User;
import com.ecommerce.repository.CommandeRepository;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserRepository userRepository;
    private final CommandeRepository commandeRepository;
    private final ReviewRepository reviewRepository;

    @GetMapping
    public ResponseEntity<List<ClientSummary>> getAllClients() {
        List<User> users = userRepository.findAll().stream()
                .filter(user -> user.getRole() == Role.CLIENT)
                .collect(Collectors.toList());

        List<ClientSummary> summaries = users.stream()
                .map(user -> {
                    long totalOrders = commandeRepository.findByUser_UserId(user.getUserId()).size();
                    BigDecimal totalSpent = commandeRepository.findByUser_UserId(user.getUserId()).stream()
                            .map(Commande::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new ClientSummary(
                            user.getUserId(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getEmail(),
                            user.getCreatedAt(),
                            totalOrders,
                            totalSpent
                    );
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(summaries);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientDetail> getClient(@PathVariable Integer id) {
        return userRepository.findById(id)
                .map(user -> {
                    List<Commande> commandes = commandeRepository.findByUser_UserId(id);
                    List<Review> reviews = reviewRepository.findByUser_UserId(id);

                    List<ClientOrder> orderDetails = commandes.stream()
                            .map(commande -> new ClientOrder(
                                    commande.getCommandeId(),
                                    commande.getTotalAmount(),
                                    commande.getStatus(),
                                    commande.getCreatedAt()
                            ))
                            .collect(Collectors.toList());

                    List<ClientReview> reviewDetails = reviews.stream()
                            .map(review -> new ClientReview(
                                    review.getReviewId(),
                                    review.getProduct().getName(),
                                    review.getRating(),
                                    review.getComment(),
                                    review.getStatus(),
                                    review.getCreatedAt()
                            ))
                            .collect(Collectors.toList());

                    BigDecimal totalSpent = commandes.stream()
                            .map(Commande::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return ResponseEntity.ok(new ClientDetail(
                            user.getUserId(),
                            user.getFirstName(),
                            user.getLastName(),
                            user.getEmail(),
                            user.getCreatedAt(),
                            orderDetails,
                            reviewDetails,
                            orderDetails.size(),
                            totalSpent
                    ));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    public record ClientSummary(
            Integer userId,
            String firstName,
            String lastName,
            String email,
            LocalDateTime createdAt,
            Long totalOrders,
            BigDecimal totalSpent
    ) {}

    public record ClientOrder(Integer commandeId, BigDecimal totalAmount, String status, LocalDateTime createdAt) {}

    public record ClientReview(Integer reviewId, String productName, Integer rating, String comment, String status, LocalDateTime createdAt) {}

    public record ClientDetail(
            Integer userId,
            String firstName,
            String lastName,
            String email,
            LocalDateTime createdAt,
            List<ClientOrder> orders,
            List<ClientReview> reviews,
            Integer totalOrders,
            BigDecimal totalSpent
    ) {}
}
