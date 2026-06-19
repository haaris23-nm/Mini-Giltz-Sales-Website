export type UserRole = "customer" | "seller" | "admin";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  phone: string;
  address: string;
  joinedAt: string;
}

export type SellerStatus = "pending" | "approved" | "rejected";

export interface Seller {
  id: string; // matches User.id
  shopName: string;
  gstin: string;
  phone: string;
  address: string;
  status: SellerStatus;
  createdDate: string;
  revenue: number;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  createdDate: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  discountPercentage: number;
  stockQuantity: number;
  images: string[];
  sellerId: string;
  sellerName: string;
  ratings: number;
  reviewsCount: number;
  reviews: Review[];
  createdDate: string;
  updatedDate: string;
  isFeatured?: boolean;
  isTrending?: boolean;
}

export interface CartItem {
  id: string; // composite or standard
  productId: string;
  name: string;
  price: number;
  discountPercentage: number;
  quantity: number;
  image: string;
  sellerId: string;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Packed"
  | "Shipped"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Returned";

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  discountPercentage: number;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  phone: string;
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  shippingCharges: number;
  paymentMethod: "razorpay" | "upi" | "card" | "cod";
  paymentStatus: "pending" | "paid" | "refunded";
  status: OrderStatus;
  createdDate: string;
  updatedDate: string;
  invoiceNumber?: string;
}

export interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
}

export interface Notification {
  id: string;
  userId: string; // "all" or specific user ID
  title: string;
  message: string;
  type: "order" | "promo" | "seller" | "general";
  isRead: boolean;
  createdDate: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon name matching
  description: string;
}
