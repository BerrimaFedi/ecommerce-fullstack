package com.ecommerce.controller;

import com.ecommerce.entity.Panier;
import com.ecommerce.entity.PanierItem;
import com.ecommerce.entity.User;
import com.ecommerce.service.PanierService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/panier")
@RequiredArgsConstructor
public class PanierController {

    private final PanierService panierService;

    @GetMapping
    public ResponseEntity<Panier> getMyPanier(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(panierService.getPanierByUserId(user.getUserId()));
    }

    @PostMapping("/add")
    public ResponseEntity<PanierItem> addItemToPanier(
            @AuthenticationPrincipal User user,
            @RequestParam Integer productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(panierService.addItemToPanier(user.getUserId(), productId, quantity));
    }

    @DeleteMapping("/item/{itemId}")
    public ResponseEntity<Void> removeItemFromPanier(@PathVariable Integer itemId) {
        panierService.removeItemFromPanier(itemId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/item/{itemId}")
    public ResponseEntity<Void> updateItemQuantity(@PathVariable Integer itemId, @RequestParam Integer quantity) {
        panierService.updateItemQuantity(itemId, quantity);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearPanier(@AuthenticationPrincipal User user) {
        Panier panier = panierService.getPanierByUserId(user.getUserId());
        panierService.clearPanier(panier.getPanierId());
        return ResponseEntity.ok().build();
    }
}
