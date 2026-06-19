package com.meesho.marketplace.service;

import com.meesho.marketplace.model.Category;
import com.meesho.marketplace.model.Product;
import com.meesho.marketplace.model.Review;
import com.meesho.marketplace.model.Seller;
import com.meesho.marketplace.repository.CategoryRepository;
import com.meesho.marketplace.repository.ProductRepository;
import com.meesho.marketplace.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Product> getProductById(UUID id) {
        return productRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsByCategory(String categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }

    @Transactional(readOnly = true)
    public List<Product> getProductsBySeller(UUID sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    @Transactional(readOnly = true)
    public List<Product> searchProducts(String query) {
        return productRepository.searchProducts(query);
    }

    @Transactional
    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    @Transactional
    public void deleteProduct(UUID productId) {
        productRepository.deleteById(productId);
    }

    @Transactional(readOnly = true)
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Review addProductReview(UUID productId, Review review) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Product target not found: " + productId));
        
        review.setProduct(product);
        Review savedReview = reviewRepository.save(review);

        // Recalculate average product ratings
        List<Review> allReviews = reviewRepository.findByProductId(productId);
        int reviewsCount = allReviews.size();
        
        double ratingsSum = allReviews.stream().mapToDouble(Review::getRating).sum();
        double avgRating = reviewsCount > 0 ? ratingsSum / reviewsCount : 5.0;

        product.setRatings(BigDecimal.valueOf(avgRating).setScale(1, RoundingMode.HALF_UP));
        product.setReviewsCount(reviewsCount);
        productRepository.save(product);

        return savedReview;
    }
}
