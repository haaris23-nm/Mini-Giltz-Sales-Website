# 🛒 Meesho-Like Multi-Seller E-Commerce Platform

This repository contains the complete full-stack codebase and database schemas for an enterprise-level, secure, and deployment-ready e-commerce platform.

---

## 🏗️ Project Architecture & Layout

The project utilizes a decoupled microservices-ready structure:
1.  **`/nextjs-frontend`**: Premium, high-speed user interface developed in Next.js, Styled with Tailwind CSS, utilizing `@supabase/supabase-js`.
2.  **`/java-springboot-backend`**: Enterprise-tier REST API engine powered by Java 17, Spring Boot, Spring Security (JWT-based session authentication), and Hibernate/JPA.
3.  **`/supabase-schema`**: Supabase PostgreSQL tables, constraints, foreign-key relations, seed categories, and Row Level Security (RLS) rules.

---

## 🗄️ Supabase Relational Schema Design

Refer to `/supabase-schema/schema.sql` for the complete database script. Below is the simplified Entity Relationship (ER) mapping overview:
*   `users` (1:1 with `sellers`) -> `customer_id` / `seller_id` on other tables are foreign keys referencing `users.id`.
*   `sellers` (1:N with `products`) -> Each seller lists and manages multiple items.
*   `products` (M:N with `carts` via `cart_items`) -> Cart line item mapping.
*   `orders` (1:N with `order_items`) -> Supports purchase receipts and invoice breakdowns.
*   `reviews` (N:1 with `products`) -> Star ratings and verification feedback comments.
*   `notifications` (N:1 with `users`) -> Tailored multi-device delivery of dispatch schedules and promotion coupons.

---

## 🔒 Spring Security & JWT Implementation

Spring Security is structured as a **Stateless Filter Chain**:
1.  **JWT Provider (`JwtUtils.java`)**: Sign, generate, read, and validate JWT tokens using high-entropy secret keys. Standard claims include `role`, `email`, and `userId`.
2.  **Security Authorization**:
    *   `/api/auth/**`: Fully public for user signup and JWT retrieval.
    *   `/api/products/public/**`: Publicly readable searches & catalogues.
    *   `/api/admin/**`: Strictly requires role mapping `hasRole('ADMIN')`.
    *   `/api/seller/**`: Strictly requires role mapping `hasAnyRole('SELLER', 'ADMIN')`.

---

## 📡 REST API Documentation

### 🔓 Public Auth Ends
*   `POST /api/auth/register` (Register Customers or Sellers)
*   `POST /api/auth/login` (Login with JWT token response)

### 🛍️ Product Catalogues
*   `GET /api/products/public` (Paginated list with query params)
*   `GET /api/products/public/{productId}` (Detail view of a specific product and reviews)

### 🛒 Customer Cart & Checkout (Authenticated)
*   `GET /api/customer/cart` (Retrieve cart items)
*   `POST /api/customer/cart/add` (Append item to cart)
*   `POST /api/customer/checkout` (Create secure payment intent with Razorpay or trigger COD order)

### 📊 Seller Portal APIs
*   `GET /api/seller/dashboard/analytics` (Revenues, item inventories, order pipelines)
*   `POST /api/seller/products` (Upload new product listing)

### 🔨 Admin Platform Control APIs
*   `GET /api/admin/sellers/pending` (Check requests)
*   `POST /api/admin/sellers/{id}/approve` (Trigger standard approval updates)

---

## 📘 Web API Specs (Swagger / OpenAPI)

Once the Spring Boot application starts, access dynamic API document endpoints at:
*   Interactive Swagger Panel: `http://localhost:8080/swagger-ui/index.html`
*   Raw OpenAPI JSON docs: `http://localhost:8080/v3/api-docs`

---

## 🐳 Docker Deployment & Configuration

To orchestrate the complete platform locally using Docker:
1.  Install Docker and Docker Compose on your host system.
2.  Navigate to the repository root directory.
3.  Deploy services simultaneously:
    ```bash
    docker-compose up --build -d
    ```
4.  Standard mappings:
    *   Next.js Frontend: `http://localhost:3001`
    *   Java Spring Boot API: `http://localhost:8080`
    *   MySQL Database: `localhost:3306` (Credentials listed in `docker-compose.yml`)
