package com.ecommerce.service;

import com.ecommerce.entity.*;
import com.ecommerce.repository.CommandeItemRepository;
import com.ecommerce.repository.CommandeRepository;
import com.ecommerce.repository.PanierItemRepository;
import com.ecommerce.repository.PaymentRepository;
import com.ecommerce.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommandeService {

    private final CommandeRepository commandeRepository;
    private final CommandeItemRepository commandeItemRepository;
    private final PanierService panierService;
    private final PanierItemRepository panierItemRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;

    public List<Commande> getCommandesByUserId(Integer userId) {
        return commandeRepository.findByUser_UserId(userId);
    }
    
    public List<Commande> getAllCommandes() {
        return commandeRepository.findAll();
    }

    @Transactional
    public Commande createCommandeFromPanier(User user, String shippingAddress) {
        Panier panier = panierService.getPanierByUserId(user.getUserId());
        List<PanierItem> items = panierItemRepository.findByPanier_PanierId(panier.getPanierId());

        if (items.isEmpty()) {
            throw new RuntimeException("Panier is empty");
        }

        BigDecimal totalAmount = items.stream()
                .map(item -> item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Commande commande = Commande.builder()
                .user(user)
                .totalAmount(totalAmount)
                .status("PENDING")
                .shippingAddress(shippingAddress)
                .build();
        
        Commande savedCommande = commandeRepository.save(commande);

        for (PanierItem item : items) {
            CommandeItem commandeItem = CommandeItem.builder()
                    .commande(savedCommande)
                    .product(item.getProduct())
                    .quantity(item.getQuantity())
                    .priceAtPurchase(item.getProduct().getPrice())
                    .build();
            commandeItemRepository.save(commandeItem);
        }

        // Clear panier after checkout
        panierService.clearPanier(panier.getPanierId());

        try {
            emailService.sendOrderConfirmationEmail(
                    user.getEmail(), 
                    user.getFirstName(), 
                    savedCommande.getCommandeId(), 
                    savedCommande.getTotalAmount().doubleValue()
            );
        } catch (Exception e) {
            System.err.println("Failed to send order confirmation email: " + e.getMessage());
        }

        return savedCommande;
    }

    public Commande updateCommandeStatus(Integer commandeId, String status) {
        return commandeRepository.findById(commandeId).map(commande -> {
            commande.setStatus(status);
            Commande saved = commandeRepository.save(commande);
            if ("PROCESSING".equals(status) || "DELIVERED".equals(status)) {
                createPaymentIfMissing(saved);
            } else if ("CANCELLED".equals(status)) {
                paymentRepository.findByCommande_CommandeId(saved.getCommandeId())
                        .ifPresent(payment -> {
                            payment.setStatus("REFUNDED");
                            paymentRepository.save(payment);
                        });
            }
            return saved;
        }).orElseThrow(() -> new RuntimeException("Commande not found"));
    }

    @Transactional
    public com.ecommerce.entity.Payment processCommandePayment(Integer commandeId) {
        Commande commande = commandeRepository.findById(commandeId)
                .orElseThrow(() -> new RuntimeException("Commande not found"));

        if ("CANCELLED".equals(commande.getStatus())) {
            throw new RuntimeException("Cannot process a cancelled commande.");
        }

        if (!"PROCESSING".equals(commande.getStatus()) && !"DELIVERED".equals(commande.getStatus())) {
            commande.setStatus("PROCESSING");
            commandeRepository.save(commande);
        }

        return createPaymentIfMissing(commande);
    }

    private com.ecommerce.entity.Payment createPaymentIfMissing(Commande commande) {
        return paymentRepository.findByCommande_CommandeId(commande.getCommandeId())
                .orElseGet(() -> {
                    com.ecommerce.entity.Payment payment = com.ecommerce.entity.Payment.builder()
                            .commande(commande)
                            .amount(commande.getTotalAmount())
                            .paymentMethod("Admin capture")
                            .status("COMPLETED")
                            .transactionId("PAY-" + commande.getCommandeId() + "-" + Instant.now().toEpochMilli())
                            .build();
                    return paymentRepository.save(payment);
                });
    }
}
