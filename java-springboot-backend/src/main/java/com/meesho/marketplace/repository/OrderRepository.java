package com.meesho.marketplace.repository;

import com.meesho.marketplace.model.Order;
import com.meesho.marketplace.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByCustomerId(UUID customerId);
    List<Order> findByStatus(OrderStatus status);
    Optional<Order> findByInvoiceNumber(String invoiceNumber);
}
