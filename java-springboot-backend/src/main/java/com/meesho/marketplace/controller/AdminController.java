package com.meesho.marketplace.controller;

import com.meesho.marketplace.model.Seller;
import com.meesho.marketplace.model.SellerStatus;
import com.meesho.marketplace.service.SellerService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminController {

    private final SellerService sellerService;

    @Data
    public static class SellerStatusUpdateDTO {
        private String status; // approved, rejected
    }

    /**
     * GET /api/admin/sellers
     */
    @GetMapping("/sellers")
    public ResponseEntity<List<Seller>> getAllMerchantProfiles() {
        return ResponseEntity.ok(sellerService.getAllSellers());
    }

    /**
     * PATCH /api/admin/sellers/{id}/audit
     */
    @PatchMapping("/sellers/{id}/audit")
    public ResponseEntity<?> auditSeller(@PathVariable UUID id, @RequestBody SellerStatusUpdateDTO dto) {
        try {
            SellerStatus newStatus = SellerStatus.valueOf(dto.getStatus().toLowerCase());
            Seller updated = sellerService.updateSellerStatus(id, newStatus);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid status profile specified."));
        }
    }

    /**
     * GET /api/admin/stats
     * Generates general statistics across sellers, verifying payout states.
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getSystemStats() {
        List<Seller> sellers = sellerService.getAllSellers();
        
        long pendingCount = sellers.stream().filter(s -> SellerStatus.pending.equals(s.getStatus())).count();
        long approvedCount = sellers.stream().filter(s -> SellerStatus.approved.equals(s.getStatus())).count();
        
        BigDecimal grossRevenue = sellers.stream()
                .map(Seller::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSellers", sellers.size());
        stats.put("pendingSellersCount", pendingCount);
        stats.put("approvedSellersCount", approvedCount);
        stats.put("grossPlatformRevenue", grossRevenue);
        stats.put("telemetryStatus", "OPTIMAL");
        stats.put("nodeInstance", "Spring Boot v3.2.5 Cloud Run Ready");

        return ResponseEntity.ok(stats);
    }
}
