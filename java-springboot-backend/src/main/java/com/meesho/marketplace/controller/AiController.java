package com.meesho.marketplace.controller;

import com.meesho.marketplace.service.GeminiService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiController {

    private final GeminiService geminiService;

    @Data
    public static class RecommendationRequestDTO {
        private List<String> browsingHistory;
        private List<Map<String, Object>> purchaseHistory;
        private List<Map<String, Object>> wishlist;
        private List<Map<String, Object>> allProducts;
    }

    @Data
    public static class ChatRequestDTO {
        private List<GeminiService.ChatMessage> messages;
    }

    @Data
    public static class ChatResponseDTO {
        private String reply;
    }

    /**
     * POST /api/recommendations
     * Calls Gemini AI or returns high-fidelity fallback if there is throttling/503
     * errors.
     */
    @PostMapping("/recommendations")
    public ResponseEntity<GeminiService.RecommendationResponse> getAiRecommendations(
            @RequestBody RecommendationRequestDTO request) {
        GeminiService.RecommendationResponse recommendations = geminiService.getRecommendations(
                request.getBrowsingHistory(),
                request.getPurchaseHistory(),
                request.getWishlist(),
                request.getAllProducts());
        return ResponseEntity.ok(recommendations);
    }

    /**
     * POST /api/support-chat
     * AI customer care agent chat.
     */
    @PostMapping("/support-chat")
    public ResponseEntity<ChatResponseDTO> chatWithSupport(@RequestBody ChatRequestDTO request) {
        String replyText = geminiService.chatWithSupport(request.getMessages());
        ChatResponseDTO response = new ChatResponseDTO();
        response.setReply(replyText);
        return ResponseEntity.ok(response);
    }
}
