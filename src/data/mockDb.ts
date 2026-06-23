import { Product, User, Seller, Order, Notification, Category } from "../types";

export interface DbState {
  users: User[];
  sellers: Seller[];
  products: Product[];
  orders: Order[];
  notifications: Notification[];
  cart: { [userId: string]: any[] }; // cart cache
  wishlist: { [userId: string]: string[] }; // wishlist of productIds
  settings: {
    upiId: string;
    qrMode: "dynamic" | "static";
  };
}

// Predefined Categories
export const CATEGORIES: Category[] = [
  { id: "ethnic-wear", name: "Ethnic Wear", icon: "Sparkles", description: "Traditional Sarees, Elegant Kurtis, Lehenga Cholis, and Salwar Suits" },
  { id: "western-wear", name: "Western Wear", icon: "Shirt", description: "Trendy Tops, Casual Jeans, T-shits, Dresses, and Jackets" },
  { id: "beauty-cosmetics", name: "Beauty & Personal Care", icon: "Smile", description: "High-quality Makeup Kits, Lipsticks, Skincare, and Hair Essentials" },
  { id: "electronics-watches", name: "Watches & Gadgets", icon: "Watch", description: "Digital smartwatches, wireless earbuds, charging accessories" },
  { id: "home-kitchen", name: "Home & Kitchen", icon: "Home", description: "Elegant bedsheets, smart organizers, cookware, and decorative mats" },
  { id: "jewelry-accessories", name: "Jewelry & Bags", icon: "Gem", description: "Charming neckpieces, hand jewelry, bags, wallets, and fashion items" }
];

// Seed Data
const SEED_USERS: User[] = [
  {
    id: "user-admin",
    email: "tamilveni2306@gmail.com",
    role: "admin",
    name: "Tamilveni (Admin)",
    phone: "9112345678",
    address: "HQ, Tech Park, Bangalore, KA - 560001",
    joinedAt: "2026-01-01T08:00:00.000Z"
  }
];

const SEED_SELLERS: Seller[] = [];
const SEED_PRODUCTS: Product[] = [];
const SEED_ORDERS: Order[] = [];
const SEED_NOTIFICATIONS: Notification[] = [];

// LocalStorage State Manager
const DB_LOCAL_KEY = "meesho_platform_db_v3";

export const getDbState = (): DbState => {
  if (typeof window === "undefined") {
    return {
      users: SEED_USERS,
      sellers: SEED_SELLERS,
      products: SEED_PRODUCTS,
      orders: SEED_ORDERS,
      notifications: SEED_NOTIFICATIONS,
      cart: {},
      wishlist: {},
      settings: {
        upiId: "tamilveni2306@okaxis",
        qrMode: "static"
      }
    };
  }

  const stored = localStorage.getItem(DB_LOCAL_KEY);
  if (!stored) {
    const initialState: DbState = {
      users: SEED_USERS,
      sellers: SEED_SELLERS,
      products: SEED_PRODUCTS,
      orders: SEED_ORDERS,
      notifications: SEED_NOTIFICATIONS,
      cart: {},
      wishlist: {},
      settings: {
        upiId: "tamilveni2306@okaxis",
        qrMode: "static"
      }
    };
    localStorage.setItem(DB_LOCAL_KEY, JSON.stringify(initialState));
    return initialState;
  }

  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Error parsing local database state. Re-seeding...", e);
    return {
      users: SEED_USERS,
      sellers: SEED_SELLERS,
      products: SEED_PRODUCTS,
      orders: SEED_ORDERS,
      notifications: SEED_NOTIFICATIONS,
      cart: {},
      wishlist: {},
      settings: {
        upiId: "tamilveni2306@okaxis",
        qrMode: "static"
      }
    };
  }
};

export const saveDbState = (state: DbState): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(DB_LOCAL_KEY, JSON.stringify(state));
  }
};
