package com.ecommerce.controller;

import com.ecommerce.entity.Commande;
import com.ecommerce.entity.User;
import com.ecommerce.service.CommandeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commandes")
@RequiredArgsConstructor
public class CommandeController {

    private final CommandeService commandeService;

    @GetMapping
    public ResponseEntity<List<Commande>> getMyCommandes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(commandeService.getCommandesByUserId(user.getUserId()));
    }

    @PostMapping("/checkout")
    public ResponseEntity<Commande> checkout(@AuthenticationPrincipal User user, @RequestParam String shippingAddress) {
        return ResponseEntity.ok(commandeService.createCommandeFromPanier(user, shippingAddress));
    }

    // Admin endpoints
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Commande>> getAllCommandes() {
        return ResponseEntity.ok(commandeService.getAllCommandes());
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Commande> updateStatus(@PathVariable Integer id, @RequestParam String status) {
        return ResponseEntity.ok(commandeService.updateCommandeStatus(id, status));
    }

    @PostMapping("/{id}/process")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<com.ecommerce.entity.Payment> processCommande(@PathVariable Integer id) {
        return ResponseEntity.ok(commandeService.processCommandePayment(id));
    }
}
