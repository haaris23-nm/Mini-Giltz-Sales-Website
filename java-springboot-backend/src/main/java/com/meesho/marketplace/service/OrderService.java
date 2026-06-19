package com.meesho.marketplace.service;

import com.meesho.marketplace.model.*;
import com.meesho.marketplace.repository.NotificationRepository;
import com.meesho.marketplace.repository.OrderRepository;
import com.meesho.marketplace.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final SellerService sellerService;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByCustomer(UUID customerId) {
        return orderRepository.findByCustomerId(customerId);
    }

    @Transactional
    public Order createOrder(Order order) {
        // Compute grand total and deduct product stock levels
        BigDecimal total = BigDecimal.ZERO;
        
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Item was removed from the catalog: " + item.getName()));

            if (product.getStockQuantity() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient inventory available for " + product.getName());
            }

            // Deduct stock
            product.setStockQuantity(product.getStockQuantity() - item.getQuantity());
            productRepository.save(product);

            // Back-calculate subtotals securely from Snapshots
            BigDecimal originalPrice = product.getPrice();
            BigDecimal discountDecimal = BigDecimal.valueOf(100).subtract(product.getDiscountPercentage())
                    .divide(BigDecimal.valueOf(100));
            BigDecimal unitFinalPrice = originalPrice.multiply(discountDecimal);
            
            BigDecimal lineTotal = unitFinalPrice.multiply(BigDecimal.valueOf(item.getQuantity()));
            total = total.add(lineTotal);

            // Log snapshot properties to OrderItem
            item.setPrice(product.getPrice());
            item.setDiscountPercentage(product.getDiscountPercentage());
        }

        order.setTotalAmount(total.add(order.getShippingCharges()).subtract(order.getDiscountAmount()));
        order.setStatus(OrderStatus.Confirmed);
        
        // Generate continuous order tracking codes
        order.setInvoiceNumber("INV-" + System.currentTimeMillis());

        Order savedOrder = orderRepository.save(order);

        // Map and allocate revenue share to participating sellers
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProductId()).orElse(null);
            if (product != null && product.getSeller() != null) {
                BigDecimal payoutAmount = item.getPrice()
                        .multiply(BigDecimal.valueOf(100).subtract(item.getDiscountPercentage()))
                        .divide(BigDecimal.valueOf(100))
                        .multiply(BigDecimal.valueOf(item.getQuantity()));
                
                sellerService.addSellerRevenue(product.getSeller().getId(), payoutAmount);

                // Notify Seller
                notificationRepository.save(Notification.builder()
                        .user(product.getSeller().getUser())
                        .title("New Order Received")
                        .message("Congratulations! You have received a new purchase for: " + item.getName() + " (Qty: " + item.getQuantity() + ")")
                        .type("seller")
                        .isRead(false)
                        .build());
            }
        }

        // Notify Customer
        notificationRepository.save(Notification.builder()
                .user(order.getCustomer())
                .title("Order Confirmed")
                .message("Your purchase invoice " + savedOrder.getInvoiceNumber() + " was confirmed successfully!")
                .type("order")
                .isRead(false)
                .build());

        return savedOrder;
    }

    @Transactional
    public Order updateOrderStatus(UUID orderId, OrderStatus newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid order handle: " + orderId));
        
        order.setStatus(newStatus);
        Order updated = orderRepository.save(order);

        // Alert buyer
        notificationRepository.save(Notification.builder()
                .user(order.getCustomer())
                .title("Order Status Updated")
                .message("Your order " + order.getInvoiceNumber() + " is now " + newStatus)
                .type("order")
                .isRead(false)
                .build());

        return updated;
    }
}
