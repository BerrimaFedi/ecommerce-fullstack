package com.ecommerce.controller;

import com.ecommerce.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/payments")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
public class AdminPaymentController {

    private final PaymentRepository paymentRepository;

    @GetMapping
    public ResponseEntity<List<PaymentDto>> getAllPayments() {
        var payments = paymentRepository.findAll().stream()
                .map(payment -> new PaymentDto(
                        payment.getPaymentId(),
                        payment.getCommande().getCommandeId(),
                        payment.getCommande().getUser().getEmail(),
                        payment.getAmount(),
                        payment.getPaymentMethod(),
                        payment.getStatus(),
                        payment.getCreatedAt()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(payments);
    }

    public record PaymentDto(
            Integer paymentId,
            Integer commandeId,
            String clientEmail,
            java.math.BigDecimal amount,
            String paymentMethod,
            String status,
            java.time.LocalDateTime createdAt
    ) {}
}
