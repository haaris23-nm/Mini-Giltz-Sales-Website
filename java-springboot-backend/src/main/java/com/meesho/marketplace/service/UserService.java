package com.meesho.marketplace.service;

import com.meesho.marketplace.model.User;
import com.meesho.marketplace.model.UserRole;
import com.meesho.marketplace.repository.UserRepository;
import com.meesho.marketplace.repository.OrderRepository;
import com.meesho.marketplace.repository.ReviewRepository;
import com.meesho.marketplace.repository.NotificationRepository;
import com.meesho.marketplace.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationRepository notificationRepository;
    private final SellerRepository sellerRepository;

    @Transactional(readOnly = true)
    public Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<User> findByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    @Transactional
    public User registerUser(User user) {
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new IllegalArgumentException("An account is already linked with this email address");
        }
        user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));
        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(UUID id, User details) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));
        
        if (!user.getEmail().equalsIgnoreCase(details.getEmail())) {
            if (userRepository.findByEmail(details.getEmail()).isPresent()) {
                throw new IllegalArgumentException("An account is already linked with this email address");
            }
            user.setEmail(details.getEmail());
        }

        user.setName(details.getName());
        user.setPhone(details.getPhone());
        user.setAddress(details.getAddress());

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + id));

        // 1. Delete seller profile if it exists
        sellerRepository.findById(id).ifPresent(sellerRepository::delete);

        // 2. Unlink user from reviews
        List<com.meesho.marketplace.model.Review> reviews = reviewRepository.findByUserId(id);
        for (com.meesho.marketplace.model.Review review : reviews) {
            review.setUser(null);
            reviewRepository.save(review);
        }

        // 3. Unlink user from orders
        List<com.meesho.marketplace.model.Order> orders = orderRepository.findByCustomerId(id);
        for (com.meesho.marketplace.model.Order order : orders) {
            order.setCustomer(null);
            orderRepository.save(order);
        }

        // 4. Delete user notifications
        List<com.meesho.marketplace.model.Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(id);
        notificationRepository.deleteAll(notifications);

        // 5. Delete the user
        userRepository.delete(user);
    }
}
