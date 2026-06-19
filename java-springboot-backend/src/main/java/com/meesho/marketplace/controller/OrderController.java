package com.meesho.marketplace.controller;

import com.meesho.marketplace.model.Order;
import com.meesho.marketplace.model.OrderStatus;
import com.meesho.marketplace.service.OrderService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    @Data
    public static class StatusDTO {
        private String status;
    }

    /**
     * GET /api/orders
     */
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    /**
     * GET /api/orders/customer/{customerId}
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Order>> getCustomerOrders(@PathVariable UUID customerId) {
        return ResponseEntity.ok(orderService.getOrdersByCustomer(customerId));
    }

    /**
     * POST /api/orders/checkout
     */
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody Order order) {
        try {
            Order processed = orderService.createOrder(order);
            return ResponseEntity.status(HttpStatus.CREATED).body(processed);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * PATCH /api/orders/{id}/status
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> changeStatus(@PathVariable UUID id, @RequestBody StatusDTO dto) {
        try {
            OrderStatus statusValue = OrderStatus.valueOf(dto.getStatus());
            Order updated = orderService.updateOrderStatus(id, statusValue);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
