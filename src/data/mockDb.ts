import { Product, User, Seller, Order, Notification, Category } from "../types";

export interface DbState {
  users: User[];
  sellers: Seller[];
  products: Product[];
  orders: Order[];
  notifications: Notification[];
  cart: { [userId: string]: any[] }; // cart cache
  wishlist: { [userId: string]: string[] }; // wishlist of productIds
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
    id: "user-customer",
    email: "customer@meesho.com",
    role: "customer",
    name: "Roshni Patel",
    phone: "9876543210",
    address: "B-201, Green Meadows, S.G. Highway, Ahmedabad, Gujarat - 380015",
    joinedAt: "2026-01-10T11:00:00.000Z"
  },
  {
    id: "user-seller-1",
    email: "seller@meesho.com",
    role: "seller",
    name: "Rajesh Sharma",
    phone: "8765432109",
    address: "Block 4, Kapda Market, Surat, Gujarat - 395003",
    joinedAt: "2026-02-15T14:30:00.000Z"
  },
  {
    id: "user-seller-2",
    email: "seller2@meesho.com",
    role: "seller",
    name: "Anjali Gupta",
    phone: "7654321098",
    address: "Chandni Chowk, Block B, New Delhi - 110006",
    joinedAt: "2026-03-01T09:15:00.000Z"
  },
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

const SEED_SELLERS: Seller[] = [
  {
    id: "user-seller-1",
    shopName: "Surat Ethnic Hub",
    gstin: "24AAAAA1111A1Z1",
    phone: "8765432109",
    address: "Block 4, Kapda Market, Surat, Gujarat - 395003",
    status: "approved",
    createdDate: "2026-02-15T14:30:00.000Z",
    revenue: 124500
  },
  {
    id: "user-seller-2",
    shopName: "Jaipur Jewels & Bags",
    gstin: "08BBBBB2222B2Z2",
    phone: "7654321098",
    address: "Chandni Chowk, Block B, New Delhi - 110006",
    status: "pending", // Pre-populated pending seller for Admin Approval demo!
    createdDate: "2026-03-01T09:15:00.000Z",
    revenue: 0
  }
];

const SEED_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Elegant Georgette Festive Saree",
    description: "Beautiful georgette saree featuring delicate zari embroidery work on the border. Lightweight, premium quality material, comes with an unstitched blouse piece. Ideal for weddings, festivals, and family gatherings.",
    category: "Ethnic Wear",
    brand: "Surat Saree Fabrics",
    price: 1299,
    discountPercentage: 45,
    stockQuantity: 45,
    images: ["https://picsum.photos/seed/saree1/600/600", "https://picsum.photos/seed/saree2/600/600"],
    sellerId: "user-seller-1",
    sellerName: "Surat Ethnic Hub",
    ratings: 4.6,
    reviewsCount: 18,
    reviews: [
      { id: "rev-1", productId: "prod-1", userName: "Priya S.", rating: 5, comment: "Absolutely stunning saree. High quality soft material!", createdDate: "2026-05-12T14:00:00Z" },
      { id: "rev-2", productId: "prod-1", userName: "Kriti M.", rating: 4, comment: "Worth the price. Very comfortable and colors match perfectly.", createdDate: "2026-05-18T09:30:00Z" }
    ],
    createdDate: "2026-02-20T10:00:00.000Z",
    updatedDate: "2026-02-20T10:00:00.000Z",
    isFeatured: true,
    isTrending: true
  },
  {
    id: "prod-2",
    name: "Classic Regular Fit Cotton Festive Kurti",
    description: "Flowing rayon cotton straight kurti decorated with traditional gold foil print. Designed in 3/4 sleeves and comfortable round split neck. Easy to pair with leggings, pants or salwars.",
    category: "Ethnic Wear",
    brand: "Abira Fashion",
    price: 799,
    discountPercentage: 50,
    stockQuantity: 60,
    images: ["https://picsum.photos/seed/kurta/600/600"],
    sellerId: "user-seller-1",
    sellerName: "Surat Ethnic Hub",
    ratings: 4.3,
    reviewsCount: 12,
    reviews: [
      { id: "rev-3", productId: "prod-2", userName: "Megha D.", rating: 5, comment: "Soft cloth, great print, and fast delivery by Meesho. Happy!", createdDate: "2026-05-22T10:15:00Z" }
    ],
    createdDate: "2026-02-22T11:30:00.000Z",
    updatedDate: "2026-02-22T11:30:00.000Z",
    isFeatured: true
  },
  {
    id: "prod-3",
    name: "Matte-Finish Waterproof Lipstick Kit (Pack of 4)",
    description: "Long-lasting, non-drying moisturizing matte lipstick collection containing popular nude and bold colors. Smudge-proof formula enriched with Vitamin E. Cruelty-free ingredients.",
    category: "Beauty & Personal Care",
    brand: "GlowMe",
    price: 499,
    discountPercentage: 35,
    stockQuantity: 120,
    images: ["https://picsum.photos/seed/makeup/600/600"],
    sellerId: "user-seller-1",
    sellerName: "Surat Ethnic Hub",
    ratings: 4.5,
    reviewsCount: 26,
    reviews: [
      { id: "rev-4", productId: "prod-3", userName: "Sneha G.", rating: 5, comment: "Nice shades! They last nearly 8 hours and don't smudge at all.", createdDate: "2026-06-02T16:22:00Z" }
    ],
    createdDate: "2026-02-25T15:00:00.000Z",
    updatedDate: "2026-02-25T15:00:00.000Z",
    isFeatured: false,
    isTrending: true
  },
  {
    id: "prod-4",
    name: "Bluetooth Calls Smartwatch with HR Monitor",
    description: "Premium large screen fitness tracker loaded with full touch control, heart rate sensors, sleep analyzer & blood oxygen saturation meters. Built-in speakers for high quality calls.",
    category: "Watches & Gadgets",
    brand: "TechVibe",
    price: 2499,
    discountPercentage: 60,
    stockQuantity: 30,
    images: ["https://picsum.photos/seed/watch1/600/600"],
    sellerId: "user-seller-2",
    sellerName: "Jaipur Jewels & Bags",
    ratings: 4.1,
    reviewsCount: 8,
    reviews: [],
    createdDate: "2026-03-02T16:00:00.000Z",
    updatedDate: "2026-03-02T16:00:00.000Z",
    isTrending: true
  },
  {
    id: "prod-5",
    name: "Ultra-Soft Cotton Double Bedsheet with Pillows",
    description: "Sleek geometric design block-printed 100% breathable pure cotton bedsheet with matching pillow cases. Premium thread count guarantees vibrant colors that do not bleed in the wash.",
    category: "Home & Kitchen",
    brand: "DecoCraft",
    price: 899,
    discountPercentage: 40,
    stockQuantity: 75,
    images: ["https://picsum.photos/seed/bedsheet/600/600"],
    sellerId: "user-seller-1",
    sellerName: "Surat Ethnic Hub",
    ratings: 4.4,
    reviewsCount: 15,
    reviews: [],
    createdDate: "2026-02-28T09:00:00.000Z",
    updatedDate: "2026-02-28T09:00:00.000Z"
  },
  {
    id: "prod-6",
    name: "Stylish Kundan & Pearl Gold Choker Set",
    description: "Ornate traditional choker necklace set adorned with shiny Kundan stones and elegant pearls hanging. Comes with a matching pair of dangling earrings. Comfortable adjustable tie-up thread back.",
    category: "Jewelry & Bags",
    brand: "Kundan Jewels",
    price: 1599,
    discountPercentage: 65,
    stockQuantity: 25,
    images: ["https://picsum.photos/seed/jewelry/600/600"],
    sellerId: "user-seller-2",
    sellerName: "Jaipur Jewels & Bags",
    ratings: 4.7,
    reviewsCount: 5,
    reviews: [],
    createdDate: "2026-03-05T14:00:00.000Z",
    updatedDate: "2026-03-05T14:00:00.000Z",
    isFeatured: true
  }
];

const SEED_ORDERS: Order[] = [
  {
    id: "ord-1001",
    customerId: "user-customer",
    customerName: "Roshni Patel",
    address: "B-201, Green Meadows, S.G. Highway, Ahmedabad, Gujarat - 380015",
    phone: "9876543210",
    items: [
      {
        productId: "prod-1",
        name: "Elegant Georgette Festive Saree",
        quantity: 1,
        price: 1299,
        discountPercentage: 45,
        image: "https://picsum.photos/seed/saree1/600/600"
      }
    ],
    totalAmount: 714.45, // (1299 * 0.55) + 0 delivery
    discountAmount: 584.55,
    shippingCharges: 0,
    paymentMethod: "cod",
    paymentStatus: "pending",
    status: "Delivered",
    createdDate: "2026-06-10T12:00:00.000Z",
    updatedDate: "2026-06-12T15:30:00.000Z",
    invoiceNumber: "INV-2026-1001"
  },
  {
    id: "ord-1002",
    customerId: "user-customer",
    customerName: "Roshni Patel",
    address: "B-201, Green Meadows, S.G. Highway, Ahmedabad, Gujarat - 380015",
    phone: "9876543210",
    items: [
      {
        productId: "prod-3",
        name: "Matte-Finish Waterproof Lipstick Kit (Pack of 4)",
        quantity: 1,
        price: 499,
        discountPercentage: 35,
        image: "https://picsum.photos/seed/makeup/600/600"
      }
    ],
    totalAmount: 324.35,
    discountAmount: 174.65,
    shippingCharges: 0,
    paymentMethod: "upi",
    paymentStatus: "paid",
    status: "Shipped",
    createdDate: "2026-06-15T18:00:00.000Z",
    updatedDate: "2026-06-16T10:00:00.000Z",
    invoiceNumber: "INV-2026-1002"
  }
];

const SEED_NOTIFICATIONS: Notification[] = [
  {
    id: "notif-1",
    userId: "user-customer",
    title: "Order Placed Successfully",
    message: "Your order INV-2026-1002 has been received and confirmed by Surat Ethnic Hub.",
    type: "order",
    isRead: false,
    createdDate: "2026-06-15T18:05:00.000Z"
  },
  {
    id: "notif-2",
    userId: "user-customer",
    title: "Weekend Festive Offer!",
    message: "Flat 20% Extra Off on all Sarees and Kurtis. Use Coupon code FESTIVE20 today.",
    type: "promo",
    isRead: true,
    createdDate: "2026-06-14T09:00:00.000Z"
  },
  {
    id: "notif-3",
    userId: "user-seller-1",
    title: "New Dispatch Pending",
    message: "Order #ord-1002 has been confirmed. Please pack and dispatch soon.",
    type: "seller",
    isRead: false,
    createdDate: "2026-06-15T18:00:00.000Z"
  }
];

// LocalStorage State Manager
const DB_LOCAL_KEY = "meesho_platform_db_v1";

export const getDbState = (): DbState => {
  if (typeof window === "undefined") {
    return {
      users: SEED_USERS,
      sellers: SEED_SELLERS,
      products: SEED_PRODUCTS,
      orders: SEED_ORDERS,
      notifications: SEED_NOTIFICATIONS,
      cart: {},
      wishlist: {}
    };
  }

  const stored = localStorage.getItem(DB_LOCAL_KEY);
  if (!stored) {
    const initialState = {
      users: SEED_USERS,
      sellers: SEED_SELLERS,
      products: SEED_PRODUCTS,
      orders: SEED_ORDERS,
      notifications: SEED_NOTIFICATIONS,
      cart: { "user-customer": [] },
      wishlist: { "user-customer": ["prod-1", "prod-3"] }
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
      wishlist: {}
    };
  }
};

export const saveDbState = (state: DbState): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(DB_LOCAL_KEY, JSON.stringify(state));
  }
};
