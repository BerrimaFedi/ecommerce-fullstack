package com.ecommerce.service;

import com.ecommerce.entity.Panier;
import com.ecommerce.entity.PanierItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.repository.PanierItemRepository;
import com.ecommerce.repository.PanierRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PanierService {

    private final PanierRepository panierRepository;
    private final PanierItemRepository panierItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Panier getPanierByUserId(Integer userId) {
        return panierRepository.findByUser_UserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
            Panier newPanier = Panier.builder().user(user).build();
            return panierRepository.save(newPanier);
        });
    }

    public PanierItem addItemToPanier(Integer userId, Integer productId, Integer quantity) {
        Panier panier = getPanierByUserId(userId);
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<PanierItem> existingItem = panierItemRepository.findByPanier_PanierId(panier.getPanierId())
                .stream()
                .filter(item -> item.getProduct().getProductId().equals(productId))
                .findFirst();

        if (existingItem.isPresent()) {
            PanierItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            return panierItemRepository.save(item);
        } else {
            PanierItem newItem = PanierItem.builder()
                    .panier(panier)
                    .product(product)
                    .quantity(quantity)
                    .build();
            return panierItemRepository.save(newItem);
        }
    }

    public void removeItemFromPanier(Integer panierItemId) {
        panierItemRepository.deleteById(panierItemId);
    }

    public void clearPanier(Integer panierId) {
        var items = panierItemRepository.findByPanier_PanierId(panierId);
        panierItemRepository.deleteAll(items);
    }

    public PanierItem updateItemQuantity(Integer panierItemId, Integer quantity) {
        PanierItem item = panierItemRepository.findById(panierItemId)
                .orElseThrow(() -> new RuntimeException("Panier item not found"));

        if (quantity <= 0) {
            panierItemRepository.delete(item);
            return item;
        }

        item.setQuantity(quantity);
        return panierItemRepository.save(item);
    }
}
