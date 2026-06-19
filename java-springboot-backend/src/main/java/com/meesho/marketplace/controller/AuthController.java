package com.meesho.marketplace.controller;

import com.meesho.marketplace.model.User;
import com.meesho.marketplace.model.UserRole;
import com.meesho.marketplace.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;

    @Data
    public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data
    public static class RegisterRequest {
        private String email;
        private String password;
        private String name;
        private String phone;
        private String address;
        private String role; // customer, seller
    }

    /**
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            UserRole roleValue = UserRole.customer;
            try {
                roleValue = UserRole.valueOf(request.getRole().toLowerCase());
            } catch (Exception ignored) {}

            User user = User.builder()
                    .email(request.getEmail())
                    .passwordHash(request.getPassword()) // Will be encrypted in service
                    .name(request.getName())
                    .phone(request.getPhone())
                    .address(request.getAddress())
                    .role(roleValue)
                    .build();

            User registered = userService.registerUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(registered);
        } catch (IllegalArgumentException e) {
            Map<String, String> errMap = new HashMap<>();
            errMap.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errMap);
        }
    }

    /**
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return userService.findByEmail(request.getEmail())
                .map(user -> {
                    if (passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
                        Map<String, Object> session = new HashMap<>();
                        session.put("user", user);
                        session.put("authToken", "JWT_TOKEN_MOCK_" + user.getId().toString());
                        session.put("status", "success");
                        return ResponseEntity.ok(session);
                    } else {
                        Map<String, String> errMap = new HashMap<>();
                        errMap.put("error", "Incorrect credentials or password.");
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errMap);
                    }
                })
                .orElseGet(() -> {
                    Map<String, String> errMap = new HashMap<>();
                    errMap.put("error", "No account registered with this email address.");
                    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errMap);
                });
    }
}
