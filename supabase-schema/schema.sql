-- Supabase PostgreSQL Relational Schema
-- Supports Meesho-like Multi-Seller E-Commerce Marketplace

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS TABLE (Handles Customer, Seller, and Admin accounts)
create table public.users (
    id uuid primary key default uuid_generate_v4(),
    email text unique not null,
    password_hash text not null,
    role text not null check (role in ('customer', 'seller', 'admin')),
    name text not null,
    phone text,
    address text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- SELLERS TABLE (Approved status holds seller listings eligibility)
create table public.sellers (
    id uuid primary key references public.users(id) on delete cascade,
    shop_name text not null,
    gstin text unique,
    phone text not null,
    address text not null,
    status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CATEGORIES TABLE
create table public.categories (
    id text primary key,
    name text not null,
    icon text,
    description text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- PRODUCTS TABLE
create table public.products (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    description text,
    category_id text references public.categories(id) on delete set null,
    brand text,
    price numeric(10,2) not null check (price >= 0),
    discount_percentage numeric(5,2) default 0.0 check (discount_percentage >= 0 and discount_percentage <= 100),
    stock_quantity integer not null default 0 check (stock_quantity >= 0),
    images text[] default '{}'::text[],
    seller_id uuid not null references public.sellers(id) on delete cascade,
    ratings numeric(2,1) default 5.0 check (ratings >= 0 and ratings <= 5.0),
    reviews_count integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CART TABLE (Header for persistent carts)
create table public.carts (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid unique not null references public.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- CART ITEMS TABLE
create table public.cart_items (
    id uuid primary key default uuid_generate_v4(),
    cart_id uuid not null references public.carts(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    quantity integer not null check (quantity > 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(cart_id, product_id)
);

-- ORDERS TABLE
create table public.orders (
    id uuid primary key default uuid_generate_v4(),
    customer_id uuid not null references public.users(id) on delete set null,
    customer_name text not null,
    address text not null,
    phone text not null,
    total_amount numeric(10,2) not null,
    discount_amount numeric(10,2) default 0.0,
    shipping_charges numeric(10,2) default 0.0,
    payment_method text not null check (payment_method in ('razorpay', 'upi', 'card', 'cod')),
    payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'refunded')),
    status text not null default 'Pending' check (status in ('Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled', 'Returned')),
    invoice_number text unique,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ORDER ITEMS TABLE
create table public.order_items (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references public.orders(id) on delete cascade,
    product_id uuid references public.products(id) on delete set null,
    name text not null,
    quantity integer not null check (quantity > 0),
    price numeric(10,2) not null,
    discount_percentage numeric(5,2) default 0.0,
    image text
);

-- PAYMENTS TABLE (Tracks transactions securely)
create table public.payments (
    id uuid primary key default uuid_generate_v4(),
    order_id uuid not null references public.orders(id) on delete cascade,
    transaction_id text unique,
    payment_gateway text default 'Razorpay',
    amount numeric(10,2) not null,
    status text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- REVIEWS TABLE
create table public.reviews (
    id uuid primary key default uuid_generate_v4(),
    product_id uuid not null references public.products(id) on delete cascade,
    user_id uuid references public.users(id) on delete set null,
    user_name text not null,
    rating integer not null check (rating >= 1 and rating <= 5),
    comment text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- WISHLIST TABLE
create table public.wishlists (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid not null references public.users(id) on delete cascade,
    product_id uuid not null references public.products(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    unique(user_id, product_id)
);

-- NOTIFICATIONS TABLE
create table public.notifications (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references public.users(id) on delete cascade, -- Null represents broadcast to all
    title text not null,
    message text not null,
    type text not null check (type in ('order', 'promo', 'seller', 'general')),
    is_read boolean default false not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Enablement (For Supabase Integration)
alter table public.users enable row level security;
alter table public.sellers enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.wishlists enable row level security;

-- Simple Select Policies for Public Reads (Products, Categories)
create policy "Allow public read for products" on public.products for select using (true);
create policy "Allow public read for categories" on public.categories for select using (true);

-- Insert Initial Categories
insert into public.categories (id, name, icon, description) values
('ethnic-wear', 'Ethnic Wear', 'Sparkles', 'Traditional Sarees, Elegant Kurtis, Lehenga Cholis, and Salwar Suits'),
('western-wear', 'Western Wear', 'Shirt', 'Trendy Tops, Casual Jeans, Jackets, and Western Frocks'),
('beauty-cosmetics', 'Beauty & Personal Care', 'Smile', 'High-quality makeup kits, lipsticks, and skincare essentials'),
('electronics-watches', 'Watches & Gadgets', 'Watch', 'Sleek smartwatches, fitness tracking bands, and custom accessories'),
('home-kitchen', 'Home & Kitchen', 'Home', 'Elegant bedsheets, smart organizers, quilts and modern cookers'),
('jewelry-accessories', 'Jewelry & Bags', 'Gem', 'Stunning necklaces, ear pendants, wallets and handbags');
