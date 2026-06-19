package com.meesho.marketplace.controller;

import com.meesho.marketplace.model.Category;
import com.meesho.marketplace.model.Product;
import com.meesho.marketplace.model.Review;
import com.meesho.marketplace.service.ProductService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    @Data
    public static class ReviewDTO {
        private String userName;
        private int rating;
        private String comment;
    }

    /**
     * GET /api/products/public/all
     */
    @GetMapping("/public/all")
    public ResponseEntity<List<Product>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    /**
     * GET /api/products/public/{id}
     */
    @GetMapping("/public/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable UUID id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/products/public/category/{categoryId}
     */
    @GetMapping("/public/category/{categoryId}")
    public ResponseEntity<List<Product>> getByCategory(@PathVariable String categoryId) {
        return ResponseEntity.ok(productService.getProductsByCategory(categoryId));
    }

    /**
     * GET /api/products/public/search?q={query}
     */
    @GetMapping("/public/search")
    public ResponseEntity<List<Product>> searchProducts(@RequestParam("q") String query) {
        return ResponseEntity.ok(productService.searchProducts(query));
    }

    /**
     * POST /api/products/{id}/reviews
     */
    @PostMapping("/{id}/reviews")
    public ResponseEntity<Review> postProductReview(@PathVariable UUID id, @RequestBody ReviewDTO dto) {
        Review review = Review.builder()
                .userName(dto.getUserName())
                .rating(dto.getRating())
                .comment(dto.getComment())
                .build();
        
        Review saved = productService.addProductReview(id, review);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * DELETE /api/products/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> removeProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * GET /api/products/public/categories
     */
    @GetMapping("/public/categories")
    public ResponseEntity<List<Category>> getCategories() {
        return ResponseEntity.ok(productService.getAllCategories());
    }
}
