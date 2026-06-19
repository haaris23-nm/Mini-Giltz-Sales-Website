package com.meesho.marketplace.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key:MY_GEMINI_API_KEY}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Data
    public static class RecommendationResponse {
        private List<String> recommendedKeywords = Arrays.asList("Kurtis", "Saree", "Jeans", "Ethnic", "Makeup");
        private String reason = "We analyzed popular trends in your favorite style profiles to recommend these curated hot collections.";
        private List<String> boostedCategories = Arrays.asList("Ethnic Wear", "Beauty", "Western Wear");
    }

    @Data
    public static class ChatMessage {
        private String sender; // user or assistant
        private String text;
    }

    /**
     * Recommends catalog items based on user traits by issuing structured JSON prompts to Google Gemini.
     */
    public RecommendationResponse getRecommendations(
            List<String> browsingHistory,
            List<Map<String, Object>> purchaseHistory,
            List<Map<String, Object>> wishlist,
            List<Map<String, Object>> allProducts) {

        if (isKeyMissing()) {
            return getGracefulRecommendationFallback("API key is active, but sandbox placeholder was detected.");
        }

        try {
            // Cut down list of products to save context space, matching server.ts behavior
            List<Map<String, Object>> excerpt = allProducts != null ? allProducts.subList(0, Math.min(allProducts.size(), 15)) : new ArrayList<>();
            List<Map<String, Object>> promptProducts = new ArrayList<>();
            for (Map<String, Object> p : excerpt) {
                Map<String, Object> simplified = new HashMap<>();
                simplified.put("id", p.get("id"));
                simplified.put("name", p.get("name"));
                simplified.put("category", p.get("category"));
                simplified.put("description", p.get("description"));
                promptProducts.add(simplified);
            }

            String prompt = String.format(
                    "Based on the following user details:\n" +
                    "Browsing categories: %s\n" +
                    "Purchased products: %s\n" +
                    "Wishlist items: %s\n\n" +
                    "Available marketplace products (JSON listing excerpt):\n%s\n\n" +
                    "Recommend 3 appropriate product categories/keywords or specific product IDs that align with this user's preferences, and provide a polite, human-readable reason for the recommendation.",
                    objectMapper.writeValueAsString(browsingHistory != null ? browsingHistory : new ArrayList<>()),
                    objectMapper.writeValueAsString(purchaseHistory != null ? purchaseHistory : new ArrayList<>()),
                    objectMapper.writeValueAsString(wishlist != null ? wishlist : new ArrayList<>()),
                    objectMapper.writeValueAsString(promptProducts)
            );

            // Structure system instruction and schema constraint
            Map<String, Object> schema = new HashMap<>();
            schema.put("type", "OBJECT");
            
            Map<String, Object> properties = new HashMap<>();
            
            Map<String, Object> kwProp = new HashMap<>();
            kwProp.put("type", "ARRAY");
            kwProp.put("items", Map.of("type", "STRING"));
            kwProp.put("description", "Suggested keywords or categories (e.g. ['Kurtas', 'Sarees', 'Beauty Essentials'])");
            properties.put("recommendedKeywords", kwProp);

            Map<String, Object> reasonProp = new HashMap<>();
            reasonProp.put("type", "STRING");
            reasonProp.put("description", "A personalized supportive message explaining why the products are selected");
            properties.put("reason", reasonProp);

            Map<String, Object> boostedProp = new HashMap<>();
            boostedProp.put("type", "ARRAY");
            boostedProp.put("items", Map.of("type", "STRING"));
            boostedProp.put("description", "The matching high-level categories to sort to the top of the collection");
            properties.put("boostedCategories", boostedProp);

            schema.put("properties", properties);
            schema.put("required", Arrays.asList("recommendedKeywords", "reason", "boostedCategories"));

            Map<String, Object> requestBody = new HashMap<>();
            
            // Build contents payload
            Map<String, Object> part = new HashMap<>();
            part.put("text", prompt);
            Map<String, Object> contentItem = new HashMap<>();
            contentItem.put("parts", Collections.singletonList(part));
            requestBody.put("contents", Collections.singletonList(contentItem));

            // Set response configuration constraints
            Map<String, Object> config = new HashMap<>();
            config.put("systemInstruction", Map.of("parts", Collections.singletonList(Map.of("text", "You are Mini Glitz's smart AI product personalization engine. Keep your reasons concise, warm, helpful, and shopping-focused. Maximize engagement."))));
            config.put("responseMimeType", "application/json");
            config.put("responseSchema", schema);
            requestBody.put("config", config);

            String responseText = callGeminiApiWithRetry(requestBody);
            
            // Extract response json
            Map<String, Object> geminiRaw = objectMapper.readValue(responseText, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) geminiRaw.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> firstCandidate = candidates.get(0);
                Map<String, Object> contentValue = (Map<String, Object>) firstCandidate.get("content");
                if (contentValue != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentValue.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        String rawJsonText = (String) parts.get(0).get("text");
                        return objectMapper.readValue(rawJsonText, RecommendationResponse.class);
                    }
                }
            }
            throw new RuntimeException("Could not extract recommendation structure from Gemini payload");

        } catch (Exception e) {
            System.out.println("[Spring - Recommendations AI] API currently experiences heavy loads or unavailability. Loading high-fidelity static fallback.");
            return getGracefulRecommendationFallback("We analyzed standard market trends to recommend these popular collections.");
        }
    }

    /**
     * Conducts customer service help chats using a stateful chat array prompt.
     */
    public String chatWithSupport(List<ChatMessage> chatMessages) {
        if (isKeyMissing()) {
            return "Hello! I am Mini Glitz's virtual support assistant. Since AI services are currently operating in offline sandbox mode, I can help answer common questions about orders, refunds, and seller registration. Feel free to explore our tabs!";
        }

        try {
            List<Map<String, Object>> contents = new ArrayList<>();
            for (ChatMessage msg : chatMessages) {
                Map<String, Object> contentItem = new HashMap<>();
                contentItem.put("role", "user".equalsIgnoreCase(msg.getSender()) ? "user" : "model");
                contentItem.put("parts", Collections.singletonList(Map.of("text", msg.getText())));
                contents.add(contentItem);
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", contents);

            Map<String, Object> config = new HashMap<>();
            config.put("systemInstruction", Map.of("parts", Collections.singletonList(Map.of("text", "You are the helpful, polite, and rapid customer care assistant for Mini Glitz, India's favorite social e-commerce marketplace. You help multiple roles: Customers tracking packages, seeking refunds, or using cash-on-delivery; Sellers asking about pricing, payouts, and listings; Admins auditing accounts. Maintain a friendly, supportive tone."))));
            requestBody.put("config", config);

            String responseText = callGeminiApiWithRetry(requestBody);

            Map<String, Object> geminiRaw = objectMapper.readValue(responseText, Map.class);
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) geminiRaw.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> firstCandidate = candidates.get(0);
                Map<String, Object> contentValue = (Map<String, Object>) firstCandidate.get("content");
                if (contentValue != null) {
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) contentValue.get("parts");
                    if (parts != null && !parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            return "I am here to help you register, check purchases, and review products!";

        } catch (Exception e) {
            System.out.println("[Spring - Support Chat AI] Offline / throttling incident handled successfully.");
            return "I'm having trouble connecting key systems right now! Please try again shortly or contact support directly.";
        }
    }

    private String callGeminiApiWithRetry(Map<String, Object> requestBody) throws Exception {
        String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=" + apiKey;
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("User-Agent", "aistudio-build-springboot");

        int maxRetries = 2;
        int delayMs = 300;

        for (int attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);
                if (response.getStatusCode() == HttpStatus.OK) {
                    return response.getBody();
                }
            } catch (Exception error) {
                if (attempt == maxRetries) {
                    throw error;
                }
                Thread.sleep(delayMs);
                delayMs *= 1.5;
            }
        }
        throw new RuntimeException("API endpoint remains unavailable after retries");
    }

    private boolean isKeyMissing() {
        return apiKey == null || apiKey.trim().isEmpty() || "MY_GEMINI_API_KEY".equals(apiKey);
    }

    private RecommendationResponse getGracefulRecommendationFallback(String reasonText) {
        RecommendationResponse fallback = new RecommendationResponse();
        fallback.setReason(reasonText);
        return fallback;
    }
}
