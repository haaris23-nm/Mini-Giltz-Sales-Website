package com.meesho.marketplace.repository;

import com.meesho.marketplace.model.Seller;
import com.meesho.marketplace.model.SellerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SellerRepository extends JpaRepository<Seller, UUID> {
    List<Seller> findByStatus(SellerStatus status);
}
