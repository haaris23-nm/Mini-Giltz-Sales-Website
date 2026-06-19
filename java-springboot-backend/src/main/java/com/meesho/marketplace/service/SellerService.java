package com.meesho.marketplace.service;

import com.meesho.marketplace.model.Seller;
import com.meesho.marketplace.model.SellerStatus;
import com.meesho.marketplace.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final SellerRepository sellerRepository;

    @Transactional(readOnly = true)
    public List<Seller> getAllSellers() {
        return sellerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Seller> getSellerById(UUID id) {
        return sellerRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Seller> getSellersByStatus(SellerStatus status) {
        return sellerRepository.findByStatus(status);
    }

    @Transactional
    public Seller saveSellerOnboarding(Seller seller) {
        seller.setStatus(SellerStatus.pending);
        seller.setRevenue(BigDecimal.ZERO);
        return sellerRepository.save(seller);
    }

    @Transactional
    public Seller updateSellerStatus(UUID sellerId, SellerStatus status) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Merchant not registered with status."));
        seller.setStatus(status);
        return sellerRepository.save(seller);
    }

    @Transactional
    public void addSellerRevenue(UUID sellerId, BigDecimal orderAmount) {
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (seller != null) {
            seller.setRevenue(seller.getRevenue().add(orderAmount));
            sellerRepository.save(seller);
        }
    }
}
