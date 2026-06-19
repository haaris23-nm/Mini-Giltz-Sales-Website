import React, { useState, useEffect } from "react";
import {
  getDbState,
  saveDbState,
  CATEGORIES,
  DbState,
} from "./data/mockDb";
import { User, Product, Order, Notification, CartItem, OrderStatus } from "./types";
import ProductCard from "./components/ProductCard";
import AIChatBot from "./components/AIChatBot";
import { AboutPage, ContactPage } from "./components/StaticPages";
import AdminDashboard from "./components/AdminDashboard";
import SellerDashboard from "./components/SellerDashboard";
import CustomerDashboard from "./components/CustomerDashboard";

// Lucide Icons
import {
  ShoppingBag,
  Search,
  ShoppingCart,
  Heart,
  User as UserIcon,
  LogOut,
  Sparkles,
  ChevronRight,
  Filter,
  ArrowUpDown,
  Check,
  Percent,
  AlertCircle,
  Truck,
  CreditCard,
  Building2,
  ShieldCheck,
  ChevronLeft,
  X,
  Star
} from "lucide-react";

export default function App() {
  // Database States
  const [dbState, setDbState] = useState<DbState>(getDbState());

  // Current session management values
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Default logged in as customer for instant exploration
    const defaultCust = dbState.users.find((u) => u.role === "customer");
    return defaultCust || null;
  });

  // Navigation page views
  // "home" | "login" | "register" | "details" | "cart" | "checkout" | "dashboard" | "about" | "contact"
  const [activePage, setActivePage] = useState<string>("home");

  // Selected details
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("popular"); // "popular" | "price-asc" | "price-desc" | "ratings"
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);

  // Cart values (local to current user)
  const [userCart, setUserCart] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string>("");
  const [couponOffset, setCouponOffset] = useState<number>(0);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");

  // Checkout checkout states
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "upi" | "card" | "razorpay">("cod");
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [lastCreatedOrder, setLastCreatedOrder] = useState<Order | null>(null);

  // AI Recommendations
  const [aiSuggestions, setAiSuggestions] = useState<{
    recommendedKeywords: string[];
    reason: string;
    boostedCategories: string[];
  } | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);

  // UPI QR Code Simulator states
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [upiTimer, setUpiTimer] = useState(120);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Sync state changes with localStorage
  const syncDb = (updatedState: DbState) => {
    setDbState(updatedState);
    saveDbState(updatedState);
  };

  // On Login change inside App, load Cart and Wishlist
  useEffect(() => {
    if (currentUser) {
      const userCarts = dbState.cart[currentUser.id] || [];
      setUserCart(userCarts);
      fetchAIRecommendations();
    } else {
      setUserCart([]);
      setAiSuggestions(null);
    }
  }, [currentUser]);

  // Call Server-Side AI Recommendations using the standard @google/genai proxy route
  const fetchAIRecommendations = async () => {
    if (!currentUser) return;
    setLoadingAI(true);
    try {
      const wishlistProducts = dbState.products.filter(p =>
        (dbState.wishlist[currentUser.id] || []).includes(p.id)
      );
      const purchasedOrders = dbState.orders.filter(o => o.customerId === currentUser.id && o.status === "Delivered");
      const purchasedItems = purchasedOrders.flatMap(o => o.items);

      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          browsingHistory: [selectedCategory].filter(Boolean),
          purchaseHistory: purchasedItems,
          wishlist: wishlistProducts,
          allProducts: dbState.products
        })
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data);
      }
    } catch (error) {
      console.warn("AI recommendation status response offline. Utilizing standard state cache:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  // Cart operations
  const handleAddToCart = (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!currentUser) {
      alert("Please login first to add items to your cart!");
      setActivePage("login");
      return;
    }

    const updatedCarts = { ...dbState.cart };
    const userCartItems = [...(updatedCarts[currentUser.id] || [])];

    const existingIdx = userCartItems.findIndex(i => i.productId === product.id);
    if (existingIdx !== -1) {
      userCartItems[existingIdx].quantity += 1;
    } else {
      userCartItems.push({
        id: `cart-item-${Date.now()}`,
        productId: product.id,
        name: product.name,
        price: product.price,
        discountPercentage: product.discountPercentage,
        quantity: 1,
        image: product.images[0],
        sellerId: product.sellerId
      });
    }

    updatedCarts[currentUser.id] = userCartItems;
    syncDb({ ...dbState, cart: updatedCarts });
    setUserCart(userCartItems);

    // Prompt soft dispatch notification
    const newNotif: Notification = {
      id: `notif-add-${Date.now()}`,
      userId: currentUser.id,
      title: "Product Added to Cart",
      message: `${product.name} has been placed in your checkout tray. Apply coupon to enjoy discounts!`,
      type: "general",
      isRead: false,
      createdDate: new Date().toISOString()
    };
    syncDb({
      ...dbState,
      cart: updatedCarts,
      notifications: [newNotif, ...dbState.notifications]
    });
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    if (!currentUser) return;
    const updatedCarts = { ...dbState.cart };
    const userCartItems = [...(updatedCarts[currentUser.id] || [])];

    const existingIdx = userCartItems.findIndex(i => i.productId === productId);
    if (existingIdx === -1) return;

    userCartItems[existingIdx].quantity += delta;
    if (userCartItems[existingIdx].quantity <= 0) {
      userCartItems.splice(existingIdx, 1);
    }

    updatedCarts[currentUser.id] = userCartItems;
    syncDb({ ...dbState, cart: updatedCarts });
    setUserCart(userCartItems);
  };

  const handleRemoveFromCart = (productId: string) => {
    if (!currentUser) return;
    const updatedCarts = { ...dbState.cart };
    const userCartItems = (updatedCarts[currentUser.id] || []).filter((i: any) => i.productId !== productId);

    updatedCarts[currentUser.id] = userCartItems;
    syncDb({ ...dbState, cart: updatedCarts });
    setUserCart(userCartItems);
  };

  // Wishlist operations
  const handleToggleWishlist = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentUser) {
      alert("Please login first to manage your wishlist!");
      setActivePage("login");
      return;
    }

    const updatedWish = { ...dbState.wishlist };
    const userWishItems = [...(updatedWish[currentUser.id] || [])];

    const idx = userWishItems.indexOf(product.id);
    if (idx !== -1) {
      userWishItems.splice(idx, 1);
    } else {
      userWishItems.push(product.id);
    }

    updatedWish[currentUser.id] = userWishItems;
    syncDb({ ...dbState, wishlist: updatedWish });
  };

  // Profile Address update
  const handleUpdateAddressPhone = (address: string, phone: string) => {
    if (!currentUser) return;
    const updatedUsers = dbState.users.map(u =>
      u.id === currentUser.id ? { ...u, address, phone } : u
    );
    const updatedCur = { ...currentUser, address, phone };
    setCurrentUser(updatedCur);
    syncDb({ ...dbState, users: updatedUsers });
  };

  // Ratings reviews submit
  const handleAddReview = (productId: string, rating: number, comment: string) => {
    if (!currentUser) return;
    const newRev = {
      id: `rev-add-${Date.now()}`,
      productId,
      userName: currentUser.name,
      rating,
      comment,
      createdDate: new Date().toISOString()
    };

    const updatedProducts = dbState.products.map(p => {
      if (p.id === productId) {
        const reviews = [newRev, ...p.reviews];
        const ratings = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
        return { ...p, reviews, ratings, reviewsCount: reviews.length };
      }
      return p;
    });

    syncDb({ ...dbState, products: updatedProducts });
  };

  // Logistics tracking action triggered by Seller
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    const orderToUpdate = dbState.orders.find(o => o.id === orderId);
    if (!orderToUpdate) return;

    const updatedOrders = dbState.orders.map(o =>
      o.id === orderId ? { ...o, status, updatedDate: new Date().toISOString() } : o
    );

    // Create notifications for customer
    const newNotif: Notification = {
      id: `notif-ord-${Date.now()}`,
      userId: orderToUpdate.customerId,
      title: `Order Status: ${status}`,
      message: `Great news! Your package INV-${orderId.substring(4)} has been upgraded to ${status}.`,
      type: "order",
      isRead: false,
      createdDate: new Date().toISOString()
    };

    syncDb({
      ...dbState,
      orders: updatedOrders,
      notifications: [newNotif, ...dbState.notifications]
    });
  };

  // Admin registration approvals
  const handleApproveSeller = (sellerId: string) => {
    const updatedSellers = dbState.sellers.map(s =>
      s.id === sellerId ? { ...s, status: "approved" as const } : s
    );

    // Notify approved sellers
    const newNotif: Notification = {
      id: `notif-sell-${Date.now()}`,
      userId: sellerId,
      title: "Supplier Portal Approved!",
      message: "Congratulations! Your seller account request has been accepted. You can now post product catalogs.",
      type: "seller",
      isRead: false,
      createdDate: new Date().toISOString()
    };

    syncDb({
      ...dbState,
      sellers: updatedSellers,
      notifications: [newNotif, ...dbState.notifications]
    });
  };

  const handleRejectSeller = (sellerId: string) => {
    const updatedSellers = dbState.sellers.map(s =>
      s.id === sellerId ? { ...s, status: "rejected" as const } : s
    );
    syncDb({ ...dbState, sellers: updatedSellers });
  };

  // Product removal from pool by Admin
  const handleDeleteProduct = (productId: string) => {
    const updatedProducts = dbState.products.filter(p => p.id !== productId);
    syncDb({ ...dbState, products: updatedProducts });
  };

  // Customer profile registration by Admin
  const handleAddCustomer = (cVals: any) => {
    const newUser: User = {
      ...cVals,
      id: `user-${Date.now()}`,
      joinedAt: new Date().toISOString()
    };
    syncDb({ ...dbState, users: [...dbState.users, newUser] });
  };

  // Seller self catalog creation
  const handleAddSellerProduct = (pVals: any) => {
    if (!currentUser) return;
    const newProduct: Product = {
      ...pVals,
      id: `prod-user-${Date.now()}`,
      sellerId: currentUser.id,
      sellerName: dbState.sellers.find(s => s.id === currentUser.id)?.shopName || "Self Store",
      ratings: 5.0,
      reviewsCount: 0,
      reviews: [],
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString()
    };

    syncDb({ ...dbState, products: [newProduct, ...dbState.products] });
  };

  const handleUpdateStock = (productId: string, amt: number) => {
    const updatedProducts = dbState.products.map(p =>
      p.id === productId ? { ...p, stockQuantity: Math.max(0, p.stockQuantity + amt) } : p
    );
    syncDb({ ...dbState, products: updatedProducts });
  };

  // Customer cancel order request
  const handleCancelOrder = (orderId: string) => {
    const order = dbState.orders.find(o => o.id === orderId);
    if (!order) return;

    const updatedOrders = dbState.orders.map(o =>
      o.id === orderId ? { ...o, status: "Cancelled" as const, paymentStatus: "refunded" as const } : o
    );

    // Notify seller
    const sellerIdOfProduct = dbState.products.find(p => p.id === order.items[0]?.productId)?.sellerId || "all";
    const notifySeller: Notification = {
      id: `notif-cancel-${Date.now()}`,
      userId: sellerIdOfProduct,
      title: "Order Cancelled by Customer",
      message: `Order #ord-${orderId.substring(4)} was cancelled. Items have been restocked.`,
      type: "seller",
      isRead: false,
      createdDate: new Date().toISOString()
    };

    syncDb({
      ...dbState,
      orders: updatedOrders,
      notifications: [notifySeller, ...dbState.notifications]
    });
  };

  const handleMarkNotificationRead = (notifId: string) => {
    const updatedNotifs = dbState.notifications.map(n =>
      n.id === notifId ? { ...n, isRead: true } : n
    );
    syncDb({ ...dbState, notifications: updatedNotifs });
  };

  // Login credentials verification
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErr("");
    
    const emailNorm = loginEmail.trim().toLowerCase();
    
    if (emailNorm === "tamilveni2306@gmail.com") {
      if (loginPass === "tamilveni2306") {
        const matchedAdmin = dbState.users.find(u => u.role === "admin");
        if (matchedAdmin) {
          setCurrentUser(matchedAdmin);
          setActivePage("home");
          setLoginEmail("");
          setLoginPass("");
        } else {
          setLoginErr("Admin entity not configured in database.");
        }
      } else {
        setLoginErr("Access denied: Invalid credentials.");
      }
    } else {
      // User login
      const matched = dbState.users.find(u => u.email.toLowerCase() === emailNorm);
      if (matched) {
        setCurrentUser(matched);
        setActivePage("home");
        setLoginEmail("");
        setLoginPass("");
      } else {
        setLoginErr("No user account matching this email was found. Please click register!");
      }
    }
  };

  // User account signup flow
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAddress, setRegAddress] = useState("");
  const [regRole, setRegRole] = useState<"customer" | "seller">("customer");
  const [regShopName, setRegShopName] = useState("");
  const [regGstin, setRegGstin] = useState("");

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (dbState.users.some(u => u.email.toLowerCase() === regEmail.toLowerCase())) {
      alert("This email is already registered. Please login!");
      setActivePage("login");
      return;
    }

    const newUserId = `user-${Date.now()}`;
    const newUser: User = {
      id: newUserId,
      email: regEmail,
      role: regRole,
      name: regName,
      phone: regPhone,
      address: regAddress,
      joinedAt: new Date().toISOString()
    };

    const stateToSave = { ...dbState, users: [...dbState.users, newUser] };

    // If seller role chosen, append a corresponding seller account with GST credentials
    if (regRole === "seller") {
      const newSeller: any = {
        id: newUserId,
        shopName: regShopName || `${regName}'s Corner`,
        gstin: regGstin || "24ABCDE1234F1Z0",
        phone: regPhone,
        address: regAddress,
        status: "pending", // Place in Pending pipeline so Admin Approval can be demoed!
        createdDate: new Date().toISOString(),
        revenue: 0
      };
      stateToSave.sellers = [...dbState.sellers, newSeller];
    }

    setDbState(stateToSave);
    saveDbState(stateToSave);
    setCurrentUser(newUser);

    alert(`Account created! Logged in as ${newUser.role}.`);
    setActivePage("home");

    // reset forms
    setRegName("");
    setRegEmail("");
    setRegPhone("");
    setRegAddress("");
    setRegShopName("");
    setRegGstin("");
  };

  // Switch workspace mode instantly from the top helper bar
  const handleFastSwitchRole = (role: "customer" | "seller" | "admin") => {
    const matched = dbState.users.find(u => u.role === role);
    if (matched) {
      setCurrentUser(matched);
      setActivePage("home");
    }
  };

  // Calculate cart sums
  const cartSubtotal = userCart.reduce((sum, item) => {
    const net = Math.round(item.price * (1 - item.discountPercentage / 100));
    return sum + net * item.quantity;
  }, 0);

  const discountSavings = userCart.reduce((sum, item) => {
    const listPriceTotal = item.price * item.quantity;
    const netPriceTotal = Math.round(item.price * (1 - item.discountPercentage / 100)) * item.quantity;
    return sum + (listPriceTotal - netPriceTotal);
  }, 0);

  const shippingCost = cartSubtotal > 499 || cartSubtotal ===0 ? 0 : 49;
  const grandTotal = Math.max(0, cartSubtotal + shippingCost - couponOffset);

  // Apply Coupon promo code
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "FESTIVE20") {
      const offset = Math.round(cartSubtotal * 0.2);
      setCouponOffset(offset);
      setAppliedCoupon("FESTIVE20");
    } else {
      alert("Invalid Coupon Code! Try FESTIVE20 for 20% flat discount.");
    }
    setCouponCode("");
  };

  // Trigger visual Secure Checkout process simulation
  const handleStartCheckout = () => {
    if (!currentUser) {
      alert("Please login first to proceed to secure checkout!");
      setActivePage("login");
      return;
    }
    setCheckoutName(currentUser.name);
    setCheckoutPhone(currentUser.phone);
    setCheckoutAddress(currentUser.address);
    setActivePage("checkout");
  };

  // UPI QR Code countdown timer loop
  useEffect(() => {
    let interval: any;
    if (showUpiModal && upiTimer > 0) {
      interval = setInterval(() => {
        setUpiTimer(prev => prev - 1);
      }, 1000);
    } else if (upiTimer === 0) {
      alert("Payment window expired! Please try placing your order again.");
      setShowUpiModal(false);
    }
    return () => clearInterval(interval);
  }, [showUpiModal, upiTimer]);

  const formatUpiTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper function to build & process order entries
  const processOrderPlacement = (overridePaymentMethod?: string) => {
    const finalPaymentMethod = overridePaymentMethod || paymentMethod;
    const newOrderId = `ord-${1000 + dbState.orders.length + 1}`;
    const newOrder: Order = {
      id: newOrderId,
      customerId: currentUser!.id,
      customerName: checkoutName,
      address: checkoutAddress,
      phone: checkoutPhone,
      items: userCart.map(i => ({
        productId: i.productId,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
        discountPercentage: i.discountPercentage,
        image: i.image
      })),
      totalAmount: grandTotal,
      discountAmount: discountSavings + couponOffset,
      shippingCharges: shippingCost,
      paymentMethod: finalPaymentMethod as any,
      paymentStatus: finalPaymentMethod === "cod" ? "pending" : "paid",
      status: "Pending",
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      invoiceNumber: `INV-2026-${1000 + dbState.orders.length + 1}`
    };

    // Clear Customer's Cart state
    const updatedCerts = { ...dbState.cart };
    updatedCerts[currentUser!.id] = [];

    // Subtract product stock quantities
    const updatedProducts = dbState.products.map(p => {
      const boughtItem = userCart.find(i => i.productId === p.id);
      if (boughtItem) {
        return { ...p, stockQuantity: Math.max(0, p.stockQuantity - boughtItem.quantity) };
      }
      return p;
    });

    // Notify customer and seller
    const productSellerIds = userCart.map(i => i.sellerId);
    const sellerNotif: Notification = {
      id: `notif-order-seller-${Date.now()}`,
      userId: productSellerIds[0] || "all",
      title: "New Order Dispatch Required",
      message: `Package ${newOrderId} has been secured via ${finalPaymentMethod.toUpperCase()}. Pack and ship immediately.`,
      type: "seller",
      isRead: false,
      createdDate: new Date().toISOString()
    };

    const custNotif: Notification = {
      id: `notif-order-cust-${Date.now()}`,
      userId: currentUser!.id,
      title: "Order Placed Successfully",
      message: `Your package ${newOrderId} has been securely processed. Tracking has booted.`,
      type: "order",
      isRead: false,
      createdDate: new Date().toISOString()
    };

    const nextDbState = {
      ...dbState,
      orders: [newOrder, ...dbState.orders],
      cart: updatedCerts,
      products: updatedProducts,
      notifications: [custNotif, sellerNotif, ...dbState.notifications]
    };

    syncDb(nextDbState);
    setUserCart([]);
    setAppliedCoupon("");
    setCouponOffset(0);
    setLastCreatedOrder(newOrder);
  };

  // Submit place order
  const handlePlaceOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutName || !checkoutPhone || !checkoutAddress) {
      alert("Please fill in recipient details.");
      return;
    }

    if (paymentMethod === "upi") {
      setShowUpiModal(true);
      setUpiTimer(120);
      return;
    }

    setPaymentProcessing(true);
    // Simulate Razorpay or card processing latency
    setTimeout(() => {
      processOrderPlacement();
      setPaymentProcessing(false);
    }, 2000);
  };

  // Filter products catalog dynamically
  const filteredProducts = dbState.products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesRating = ratingFilter ? p.ratings >= ratingFilter : true;

    return matchesSearch && matchesCategory && matchesRating;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-asc") {
      const priceA = a.price * (1 - a.discountPercentage / 100);
      const priceB = b.price * (1 - b.discountPercentage / 100);
      return priceA - priceB;
    }
    if (sortBy === "price-desc") {
      const priceA = a.price * (1 - a.discountPercentage / 100);
      const priceB = b.price * (1 - b.discountPercentage / 100);
      return priceB - priceA;
    }
    if (sortBy === "ratings") {
      return b.ratings - a.ratings;
    }
    // "popular" (default featured / listing)
    return b.reviewsCount - a.reviewsCount;
  });

  return (
    <div id="full-app-root" className="min-h-screen bg-[#f7f9fb] text-slate-800 flex flex-col font-sans selection:bg-pink-100 selection:text-pink-900">
      
      {/* Main E-Commerce Header */}
      <header className="bg-white sticky top-0 z-40 border-b border-slate-100 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo brand */}
          <div
            onClick={() => {
              setActivePage("home");
              setSelectedCategory("");
            }}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
          >
            <div className="text-2xl font-black text-pink-600 tracking-tighter uppercase transition-transform group-hover:scale-102">
              MINI<span className="text-slate-400 font-light">GLITZ</span>
            </div>
          </div>

          {/* Search container */}
          <div className="flex-grow max-w-md hidden md:flex items-center relative">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search Kurtis, Smartwatches, lipsticks, beauty..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActivePage("home");
              }}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-pink-500 rounded-full pl-10 pr-4 py-2 text-xs focus:outline-hidden focus:bg-white transition-all text-slate-700"
            />
          </div>

          {/* Action Hub buttons */}
          <div className="flex items-center gap-3.5 text-xs font-semibold">
            <button
              id="nav-about"
              onClick={() => setActivePage("about")}
              className={`hover:text-pink-600 transition-colors cursor-pointer ${activePage === "about" ? "text-pink-600" : "text-slate-600"}`}
            >
              About
            </button>
            <button
              id="nav-contact"
              onClick={() => setActivePage("contact")}
              className={`hover:text-pink-600 transition-colors cursor-pointer ${activePage === "contact" ? "text-pink-600" : "text-slate-600"}`}
            >
              Contact
            </button>

            <span className="h-4 w-px bg-slate-200"></span>

            {/* Cart toggle */}
            <button
              id="nav-cart-btn"
              onClick={() => setActivePage("cart")}
              className="text-slate-700 hover:text-pink-600 relative p-1.5 transition-colors cursor-pointer"
            >
              <ShoppingCart className="h-5 w-5" />
              {userCart.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-pink-600 text-[9px] text-white flex items-center justify-center rounded-full font-bold">
                  {userCart.reduce((acc, curr) => acc + curr.quantity, 0)}
                </span>
              )}
            </button>

            {/* Profile / Dashboard button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-dashboard-btn"
                  onClick={() => setActivePage("dashboard")}
                  className="bg-slate-50 hover:bg-pink-50 border border-slate-200 hover:border-pink-200 rounded-full px-3 py-1.5 text-slate-700 hover:text-pink-600 flex items-center gap-1.5 cursor-pointer max-w-[140px] truncate"
                >
                  <UserIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{currentUser.name}</span>
                </button>
                <button
                  id="logout-btn"
                  onClick={() => {
                    setCurrentUser(null);
                    setActivePage("home");
                  }}
                  className="text-slate-400 hover:text-red-600 p-1.5 cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={() => setActivePage("login")}
                  className="text-slate-700 hover:text-pink-600 font-semibold px-2 cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  id="nav-reg-btn"
                  onClick={() => setActivePage("register")}
                  className="bg-pink-600 hover:bg-pink-700 text-white rounded-full px-3.5 py-1.5 shadow-sm cursor-pointer"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Category Filter Strip on Home */}
      {activePage === "home" && (
        <div className="bg-white border-b border-slate-100 py-2 hidden md:block">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setSearchQuery("");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  selectedCategory === cat.name
                    ? "bg-pink-50 text-pink-700 font-bold border border-pink-100"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat.name}
              </button>
            ))}
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory("")}
                className="text-xs text-slate-400 hover:text-pink-600 font-bold shrink-0"
              >
                Clear Filter ✕
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Container body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-6">



        {/* PAGE: HOME (Product Listing Page) */}
        {activePage === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-in fade-in duration-200">
            
            {/* Catalog Filters Side panel */}
            <div className="lg:col-span-1 space-y-5">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs">
                
                {/* Search in sidebar for mobile */}
                <div className="block md:hidden mb-4">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Search Products</label>
                  <input
                    type="text"
                    placeholder="Search saree, watches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden text-slate-700"
                  />
                </div>

                {/* Categories filtering sidebar */}
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                      <Filter className="h-3 w-3 text-slate-400" />
                      Browse Category
                    </span>
                    {selectedCategory && (
                      <button onClick={() => setSelectedCategory("")} className="text-[10px] text-pink-600 font-bold">
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="space-y-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.name)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ${
                          selectedCategory === cat.name
                            ? "bg-pink-50 text-pink-700 font-bold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <span>{cat.name}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sorters selection */}
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider mb-3">
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    Sort Price & Stars
                  </span>
                  <div className="space-y-1">
                    {[
                      { val: "popular", label: "Popular Demand" },
                      { val: "price-asc", label: "Price (Low to High)" },
                      { val: "price-desc", label: "Price (High to Low)" },
                      { val: "ratings", label: "Highest Reviewed" },
                    ].map((sortOption) => (
                      <button
                        key={sortOption.val}
                        onClick={() => setSortBy(sortOption.val)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2 cursor-pointer ${
                          sortBy === sortOption.val
                            ? "bg-slate-100 text-slate-900 font-bold"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${sortBy === sortOption.val ? "bg-pink-600" : "bg-transparent"}`}></span>
                        <span>{sortOption.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ratings ratingFilter selection */}
                <div>
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider mb-2">
                    Review Threshold
                  </span>
                  <div className="space-y-2">
                    {[4, 3, 2].map((stars) => (
                      <button
                        key={stars}
                        onClick={() => setRatingFilter(ratingFilter === stars ? null : stars)}
                        className={`w-full text-left px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                          ratingFilter === stars ? "bg-amber-50 text-amber-800 font-bold" : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3 w-3 ${
                                s <= stars ? "fill-yellow-500 text-yellow-500" : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span>& Up ({dbState.products.filter(p => p.ratings >= stars).length})</span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Catalog Grid panel */}
            <div className="lg:col-span-3 space-y-4">
              
              {/* Results status metrics */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>
                  Showing <span className="font-bold text-slate-700">{sortedProducts.length}</span> Products{" "}
                  {selectedCategory && (
                    <>
                      under Category: <span className="text-pink-600 font-bold">{selectedCategory}</span>
                    </>
                  )}
                </span>
                <span className="font-mono text-[10px]">6-MONTH DATA SEEDED</span>
              </div>

              {/* Grid cards */}
              {sortedProducts.length === 0 ? (
                <div className="text-center py-16 bg-white border border-slate-100 rounded-2xl">
                  <p className="text-slate-500 text-sm">No items match your selected filters!</p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                      setRatingFilter(null);
                    }}
                    className="mt-4 bg-pink-600 text-white rounded-full px-4 py-1.5 text-xs font-semibold"
                  >
                    Clear Catalog Queries
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {sortedProducts.map((p) => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onViewDetails={(product) => {
                        setSelectedProduct(product);
                        setActivePage("details");
                      }}
                      onAddToCart={handleAddToCart}
                      onToggleWishlist={handleToggleWishlist}
                      isWishlisted={(dbState.wishlist[currentUser?.id || ""] || []).includes(p.id)}
                    />
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* PAGE: PRODUCT DETAILS */}
        {activePage === "details" && selectedProduct && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-in fade-in duration-200">
            <button
              onClick={() => setActivePage("home")}
              className="text-slate-500 hover:text-pink-600 text-xs font-semibold mb-6 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4" /> Back to Products Catalog
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              
              {/* Product Images Panel */}
              <div className="space-y-4">
                <div className="aspect-square bg-slate-50/50 rounded-2xl overflow-hidden border border-slate-100">
                  <img
                    src={selectedProduct.images[0]}
                    alt={selectedProduct.name}
                    referrerPolicy="no-referrer"
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex gap-2">
                  {selectedProduct.images.map((img, idx) => (
                    <div key={idx} className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-lg overflow-hidden cursor-pointer hover:border-pink-300">
                      <img src={img} alt="" referrerPolicy="no-referrer" className="object-cover h-full w-full" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Product Specifications details */}
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-pink-600 bg-pink-50 px-3 py-1 rounded-full uppercase tracking-wider block w-max mb-3">
                    {selectedProduct.category}
                  </span>
                  <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight leading-snug">
                    {selectedProduct.name}
                  </h1>
                  <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-wider">
                    Brand: <span className="text-slate-700 font-semibold">{selectedProduct.brand}</span> • Supplier Shop: <span className="text-pink-600 font-semibold">{selectedProduct.sellerName}</span>
                  </p>
                </div>

                {/* Ratings */}
                <div className="flex items-center gap-2 border-y border-slate-100 py-3">
                  <div className="flex items-center gap-1 bg-green-600 text-white font-bold text-xs px-2 py-0.5 rounded">
                    <span>{selectedProduct.ratings.toFixed(1)}</span>
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{selectedProduct.reviewsCount} verified reviews on Meesho</span>
                </div>

                {/* Price block */}
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold font-display text-slate-950">
                      ₹{Math.round(selectedProduct.price * (1 - selectedProduct.discountPercentage / 100))}
                    </span>
                    {selectedProduct.discountPercentage > 0 && (
                      <>
                        <span className="text-sm text-slate-400 line-through">₹{selectedProduct.price}</span>
                        <span className="text-sm font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-md">
                          {Math.round(selectedProduct.discountPercentage)}% Discount Enabled
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold block mt-1.5 uppercase">Free cash on delivery available</span>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    id="details-add-cart"
                    onClick={() => handleAddToCart(selectedProduct)}
                    disabled={selectedProduct.stockQuantity === 0}
                    className="flex-grow bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs py-3 px-6 rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 transition"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {selectedProduct.stockQuantity === 0 ? "Currently Out of Stock" : "Place in Bag / Add to Cart"}
                  </button>
                  <button
                    id="details-wishlist-toggle"
                    onClick={(e) => handleToggleWishlist(selectedProduct, e)}
                    className="bg-slate-50 text-slate-700 hover:text-pink-600 border hover:border-pink-300 rounded-xl px-4 py-3 cursor-pointer flex items-center justify-center gap-1.5 shrink-0 transition"
                  >
                    <Heart
                      className={`h-4.5 w-4.5 ${
                        (dbState.wishlist[currentUser?.id || ""] || []).includes(selectedProduct.id)
                          ? "fill-pink-600 text-pink-600"
                          : ""
                      }`}
                    />
                    Wishlist
                  </button>
                </div>

                {/* Specifications details */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">Item Specifications</h4>
                  <p className="text-slate-600 text-xs leading-relaxed font-medium">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Reviews Section */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="font-display font-bold text-lg text-slate-800 tracking-tight mb-4">
                Verified Customer Reviews ({selectedProduct.reviewsCount})
              </h3>

              {selectedProduct.reviews.length === 0 ? (
                <p className="text-xs text-slate-400">No reviews published yet. Be the first to buy and share your star rating!</p>
              ) : (
                <div className="space-y-4">
                  {selectedProduct.reviews.map((rev) => (
                    <div key={rev.id} className="bg-slate-50 border border-slate-100/60 p-4 rounded-xl text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-700">{rev.userName}</span>
                        <div className="flex gap-0.5 text-yellow-500 text-[10px] items-center">
                          <span>{rev.rating} ★</span>
                        </div>
                      </div>
                      <p className="text-slate-500 leading-relaxed italic">"{rev.comment}"</p>
                      <span className="text-[9px] text-slate-400 block text-right">
                        Reviewed on: {new Date(rev.createdDate).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Products segment */}
            <div className="border-t border-slate-100 pt-8 mt-10">
              <h3 className="font-display font-bold text-base text-slate-800 mb-4">Related Festive Collections</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {dbState.products
                  .filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id)
                  .slice(0, 4)
                  .map(p => (
                    <div
                      key={p.id}
                      onClick={() => setSelectedProduct(p)}
                      className="border border-slate-100 rounded-xl p-3 bg-slate-50/50 hover:bg-slate-50 cursor-pointer text-xs flex gap-2.5 items-center leading-normal"
                    >
                      <img src={p.images[0]} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded object-cover shadow-xs" />
                      <div className="truncate">
                        <h4 className="font-bold text-slate-800 truncate">{p.name}</h4>
                        <p className="font-semibold text-pink-600">₹{Math.round(p.price * (1 - p.discountPercentage / 100))}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

          </div>
        )}

        {/* PAGE: CART */}
        {activePage === "cart" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-in fade-in duration-200">
            <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight mb-6">
              My Checkout Bag ({userCart.length} Unique Items)
            </h1>

            {userCart.length === 0 ? (
              <div className="text-center py-16">
                <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Your cart bag is currently empty.</p>
                <button
                  onClick={() => setActivePage("home")}
                  className="mt-4 bg-pink-600 text-white rounded-full px-5 py-2 text-xs font-semibold shadow-xs cursor-pointer"
                >
                  Start Exploring Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Cart list */}
                <div className="lg:col-span-2 space-y-4">
                  {userCart.map((item) => {
                    const discounted = Math.round(item.price * (1 - item.discountPercentage / 100));
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col sm:flex-row items-center justify-between border border-slate-100 rounded-xl p-4 bg-slate-50/50 gap-4"
                      >
                        <div className="flex items-center gap-3.5 self-start sm:self-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                            className="h-14 w-14 rounded-lg object-cover shadow-xs"
                          />
                          <div>
                            <h3 className="font-bold text-slate-800 text-xs lines-clamp-2 max-w-xs">{item.name}</h3>
                            <div className="flex items-baseline gap-2 mt-1">
                              <span className="font-bold text-slate-900 text-xs">₹{discounted}</span>
                              {item.discountPercentage > 0 && (
                                <span className="text-[10px] text-slate-400 line-through">₹{item.price}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Qty selectors & Remove */}
                        <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                          <div className="flex items-center gap-1.5 border border-slate-200 rounded-lg p-1 bg-white shadow-3xs">
                            <button
                              onClick={() => handleUpdateCartQty(item.productId, -1)}
                              className="px-2 py-0.5 text-xs text-slate-500 font-bold hover:bg-slate-50 rounded"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-slate-800 w-6 text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateCartQty(item.productId, 1)}
                              className="px-2 py-0.5 text-xs text-slate-500 font-bold hover:bg-slate-50 rounded"
                            >
                              +
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveFromCart(item.productId)}
                            className="text-red-500 hover:text-red-700 p-2 text-xs font-bold hover:bg-red-50 rounded-lg transition"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bill Breakdown Side summary */}
                <div className="lg:col-span-1 space-y-5">
                  
                  {/* Coupon card */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block mb-1">
                      Save Extra Cash
                    </span>
                    <h4 className="text-xs font-bold text-slate-800 mb-3">Apply Coupon Code</h4>
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. FESTIVE20"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-grow bg-white border border-slate-200 rounded-xl px-3 py-1.5 uppercase text-xs focus:outline-hidden"
                      />
                      <button
                        id="apply-coupon-btn"
                        type="submit"
                        className="bg-slate-900 hover:bg-black text-white text-xs px-4 py-1.5 rounded-xl font-bold transition"
                      >
                        Apply
                      </button>
                    </form>
                    {appliedCoupon && (
                      <div className="bg-green-50 text-green-700 text-[10px] p-2 border border-green-100 rounded-lg mt-3 flex items-center justify-between font-semibold">
                        <span>Coupon Active: "{appliedCoupon}" (-20% Off)</span>
                        <button
                          onClick={() => {
                            setAppliedCoupon("");
                            setCouponOffset(0);
                          }}
                          className="text-green-800 hover:text-red-500 font-black"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Summary bill */}
                  <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-xs space-y-3.5 text-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Cart Payment Summary
                    </span>

                    <div className="space-y-2 border-b border-slate-100 pb-3">
                      <div className="flex justify-between text-slate-600">
                        <span>Bag Total</span>
                        <span>₹{cartSubtotal}</span>
                      </div>
                      <div className="flex justify-between text-pink-600 font-medium">
                        <span>Item Discount benefits</span>
                        <span>- ₹{discountSavings}</span>
                      </div>
                      {couponOffset > 0 && (
                        <div className="flex justify-between text-green-600 font-medium">
                          <span>Coupon Flat Promo</span>
                          <span>- ₹{couponOffset}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-600">
                        <span>Delivery charges</span>
                        <span>{shippingCost === 0 ? "FREE" : `₹${shippingCost}`}</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm font-bold text-slate-900 pt-1">
                      <span>Total Amount to Pay</span>
                      <span>₹{grandTotal}</span>
                    </div>

                    <button
                      id="cart-checkout-btn"
                      onClick={handleStartCheckout}
                      className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-center py-2.5 rounded-xl mt-4 block shadow-md hover:shadow-lg transition cursor-pointer text-xs"
                    >
                      Secure Checkout
                    </button>
                  </div>

                </div>

              </div>
            )}
          </div>
        )}

        {/* PAGE: CHECKOUT */}
        {activePage === "checkout" && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-in fade-in duration-200">
            <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight mb-6">
              Secure Checkout & Delivery Address
            </h1>

            <form onSubmit={handlePlaceOrderSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              
              {/* Recipient Coordinates Card */}
              <div className="lg:col-span-3 space-y-4">
                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase">
                  1. Shipping Information
                </span>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Recipient Full Name</label>
                  <input
                    type="text"
                    required
                    value={checkoutName}
                    onChange={(e) => setCheckoutName(e.target.value)}
                    placeholder="e.g. Roshni Patel"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Mobile Contact Phone</label>
                  <input
                    type="tel"
                    required
                    value={checkoutPhone}
                    onChange={(e) => setCheckoutPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Full Delivery Street Address</label>
                  <textarea
                    required
                    rows={3}
                    value={checkoutAddress}
                    onChange={(e) => setCheckoutAddress(e.target.value)}
                    placeholder="Street name, sector, house number, pin code, city..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Payment Methods selector and Order recap */}
              <div className="lg:col-span-2 space-y-4">
                <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase">
                  2. Gate Payment Option
                </span>

                <div className="space-y-2.5">
                  {[
                    { val: "cod", label: "Cash On Delivery (COD)", desc: "Pay cash at your doorstep. (Easiest & default)" },
                    { val: "upi", label: "Smart UPI (GooglePay / PhonePe)", desc: "High contrast quick QR code scanner simulator." },
                    { val: "card", label: "Debit / Credit / Mastercard", desc: "Process transaction using secure server rails." },
                    { val: "razorpay", label: "Razorpay Standard Gateway", desc: "Full-stack payment interface simulator." },
                  ].map((payOpt) => (
                    <div
                      key={payOpt.val}
                      onClick={() => setPaymentMethod(payOpt.val as any)}
                      className={`border rounded-xl p-3 cursor-pointer flex items-start gap-2.5 transition-all ${
                        paymentMethod === payOpt.val
                          ? "border-pink-500 bg-pink-50/20 shadow-3xs"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={paymentMethod === payOpt.val}
                        onChange={() => {}} // handled by click container
                        className="mt-0.5 h-3.5 w-3.5 accent-pink-600 text-pink-600"
                      />
                      <div className="text-xs">
                        <h4 className="font-bold text-slate-800">{payOpt.label}</h4>
                        <p className="text-slate-400 text-[10px] whitespace-normal mt-0.5">{payOpt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Secure purchase confirmation button */}
                <div className="border-t border-slate-100 pt-4 mt-6">
                  <div className="flex justify-between text-xs font-bold mb-3">
                    <span className="text-slate-500">Recalculated Grand Total:</span>
                    <span className="text-slate-900 text-sm font-display">₹{grandTotal}</span>
                  </div>

                  {paymentProcessing && (
                    <div className="bg-pink-50 text-pink-700 text-[11px] p-2.5 rounded-lg border border-pink-100 font-semibold mb-3 flex items-center gap-2 animate-bounce">
                      <CreditCard className="h-4 w-4 shrink-0 animate-pulse text-pink-600" />
                      <span>Contacting payment gateway merchant secure portal...</span>
                    </div>
                  )}

                  <button
                    id="checkout-confirm-btn"
                    type="submit"
                    disabled={paymentProcessing}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold text-center py-2.5 text-xs rounded-xl shadow-md disabled:opacity-50 transition cursor-pointer uppercase tracking-wider"
                  >
                    Confirm & Place Dispatch
                  </button>
                </div>
              </div>

            </form>
          </div>
        )}

        {/* PAGE: ORDER SUCCESS & TRACKING PREVIEW */}
        {activePage === "tracking" && lastCreatedOrder && (
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs animate-in fade-in duration-200 text-center max-w-3xl mx-auto">
            <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Check className="h-6 w-6 stroke-[3px]" />
            </div>

            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest">
              Purchase Success & Dispatched
            </span>
            <h1 className="font-display font-black text-3xl tracking-tight text-slate-900 mt-3 mb-2">
              Order Confirmed successfully!
            </h1>
            <p className="text-slate-500 text-xs max-w-lg mx-auto leading-relaxed">
              Congratulations! Your Meesho order checkout has completed. Below is your dynamic shipment coordinates tracking block. Use Customer Mode to view dispatch details anytime.
            </p>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-xl text-left text-xs my-6 space-y-4 max-w-xl mx-auto">
              <div className="flex justify-between items-center border-b pb-2">
                <div>
                  <p className="font-mono font-bold text-pink-600">Order Ref: {lastCreatedOrder.id}</p>
                  <p className="text-[10px] text-slate-400">Invoice: {lastCreatedOrder.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700 uppercase">{lastCreatedOrder.status}</span>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-2">
                {lastCreatedOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-600 truncate max-w-[280px]">
                      x{it.quantity} {it.name}
                    </span>
                    <span className="font-bold text-slate-700">₹{Math.round(it.price * (1 - it.discountPercentage / 100)) * it.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border-t pt-3 flex justify-between items-center font-bold text-slate-800">
                <span>Total Amount Paid ({lastCreatedOrder.paymentMethod.toUpperCase()})</span>
                <span>₹{lastCreatedOrder.totalAmount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center mt-4">
              <button
                id="track-dash-toggle"
                onClick={() => {
                  setActivePage("dashboard");
                }}
                className="bg-slate-900 hover:bg-black text-white text-xs font-semibold py-2 px-5 rounded-xl cursor-pointer"
              >
                Go Track order
              </button>
              <button
                onClick={() => setActivePage("home")}
                className="border border-slate-200 text-slate-600 hover:text-pink-600 hover:border-pink-300 py-2 px-5 rounded-xl text-xs font-semibold"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}

        {/* PAGE: STATIC ABOUT PAGE */}
        {activePage === "about" && <AboutPage />}

        {/* PAGE: STATIC CONTACT PAGE */}
        {activePage === "contact" && <ContactPage />}

        {/* PAGE: LOGIN */}
        {activePage === "login" && (
          <div className="max-w-md mx-auto bg-white border border-slate-100 rounded-2xl p-8 shadow-sm animate-in fade-in duration-200 my-8">
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider block w-max mx-auto mb-2">
              MINI GLITZ PORTAL
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight text-center mb-6">
              Access your Portal
            </h2>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email ID</label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="customer@miniglitz.com or seller@miniglitz.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Secure Password</label>
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden text-slate-700"
                />
              </div>

              {loginErr && (
                <div className="bg-red-50 text-red-600 text-[10px] p-2 rounded-lg border border-red-100">
                  {loginErr}
                </div>
              )}

              <button
                id="login-submit-btn"
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-center py-2 text-xs rounded-xl shadow cursor-pointer uppercase transition"
              >
                Sign In
              </button>
            </form>

            <div className="border-t border-slate-100 pt-5 mt-6 text-center text-xs text-slate-400 font-medium">
              Don't have an online profile?{" "}
              <button onClick={() => setActivePage("register")} className="text-pink-600 hover:underline font-bold">
                Register a new profile
              </button>
            </div>
          </div>
        )}

        {/* PAGE: REGISTER */}
        {activePage === "register" && (
          <div className="max-w-md mx-auto bg-white border border-slate-100 rounded-2xl p-8 shadow-sm animate-in fade-in duration-200 my-8">
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-full uppercase tracking-wider block w-max mx-auto mb-2">
              MINI GLITZ SIGNUP
            </span>
            <h2 className="font-display font-bold text-2xl text-slate-800 tracking-tight text-center mb-6">
              Join as a Customer or Supplier
            </h2>

            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Roshni Patel"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email ID</label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="roshni@example.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Registry Role Type</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setRegRole("customer")}
                    className={`border p-2 rounded-xl font-bold text-center cursor-pointer transition ${
                      regRole === "customer"
                        ? "border-pink-500 bg-pink-50/20 text-pink-700"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    Shopper (Customer)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole("seller")}
                    className={`border p-2 rounded-xl font-bold text-center cursor-pointer transition  ${
                      regRole === "seller"
                        ? "border-pink-500 bg-pink-50/20 text-pink-700"
                        : "border-slate-100 hover:bg-slate-50"
                    }`}
                  >
                    Supplier (Seller)
                  </button>
                </div>
              </div>

              {regRole === "seller" && (
                <div className="bg-pink-50/30 border border-pink-100/50 p-4 rounded-xl space-y-3.5 animate-in slide-in-from-top-2 duration-150">
                  <span className="text-[10px] font-bold text-pink-600 uppercase tracking-widest block">Seller Credentials</span>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">Supplier / Shop Name</label>
                    <input
                      type="text"
                      required
                      value={regShopName}
                      onChange={(e) => setRegShopName(e.target.value)}
                      placeholder="e.g. Surat Fabrics Hub"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-1">GSTIN Number (15 digits)</label>
                    <input
                      type="text"
                      required
                      value={regGstin}
                      onChange={(e) => setRegGstin(e.target.value)}
                      placeholder="e.g. 24AAAAA1111A1Z1"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Complete Delivery Address</label>
                <textarea
                  required
                  rows={2}
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  placeholder="Street, sector, housing complex, state & pin code..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden text-slate-700"
                />
              </div>

              <button
                id="register-submit-btn"
                type="submit"
                className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold text-center py-2 text-xs rounded-xl shadow cursor-pointer uppercase transition"
              >
                Sign Up Profile
              </button>
            </form>

            <div className="border-t border-slate-100 pt-5 mt-6 text-center text-xs text-slate-400 font-medium">
              Already have an offline profile?{" "}
              <button onClick={() => setActivePage("login")} className="text-pink-600 hover:underline font-bold">
                Sign In
              </button>
            </div>
          </div>
        )}

        {/* PAGE: INTERACTIVE ACCOUNT DASHBOARDS (Customer/Seller/Admin Routing) */}
        {activePage === "dashboard" && currentUser && (
          <div className="animate-in fade-in duration-200">
            {currentUser.role === "customer" && (
              <CustomerDashboard
                currentUser={currentUser}
                dbState={dbState}
                onUpdateAddress={handleUpdateAddressPhone}
                onAddReview={handleAddReview}
                onCancelOrder={handleCancelOrder}
                onMarkNotificationRead={handleMarkNotificationRead}
              />
            )}

            {currentUser.role === "seller" && (
              <SellerDashboard
                currentUser={currentUser}
                dbState={dbState}
                onAddProduct={handleAddSellerProduct}
                onUpdateStock={handleUpdateStock}
                onUpdateOrderStatus={handleUpdateOrderStatus}
              />
            )}

            {currentUser.role === "admin" && (
              <AdminDashboard
                dbState={dbState}
                onApproveSeller={handleApproveSeller}
                onRejectSeller={handleRejectSeller}
                onDeleteProduct={handleDeleteProduct}
                onAddProduct={handleAddSellerProduct}
                onAddCustomer={handleAddCustomer}
              />
            )}
          </div>
        )}

      </main>

      {showUpiModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
            {/* Header branding */}
            <div className="flex items-center justify-center gap-1.5 border-b border-slate-100 pb-3">
              <span className="bg-pink-600 text-white font-black text-xs px-2.5 py-0.5 rounded-full">
                MINIGLITZ PAY
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Secure UPI Interface
              </span>
            </div>

            {/* Title & timer */}
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pay using GPay / PhonePe / BHIM</h3>
              <p className="text-slate-500 text-xs mt-1">Scan the QR code using any UPI application to complete payment.</p>
              
              <div className="mt-3 flex items-center justify-center gap-1.5 bg-pink-50 text-pink-700 font-bold text-xs py-1.5 px-3 rounded-full w-max mx-auto">
                <span className="h-2 w-2 bg-pink-600 rounded-full animate-ping"></span>
                <span>Active Payment Window: {formatUpiTime(upiTimer)}</span>
              </div>
            </div>

            {/* QR Code image container */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col items-center justify-center relative">
              {verifyingPayment ? (
                <div className="h-[200px] flex flex-col items-center justify-center gap-3">
                  <div className="h-8 w-8 border-4 border-pink-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-slate-700 animate-pulse">Verifying UPI network transaction reference...</span>
                </div>
              ) : (
                <>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=10&data=${encodeURIComponent(
                      `upi://pay?pa=tamilveni2306@okaxis&pn=MiniGlitz&am=${grandTotal}&cu=INR`
                    )}`}
                    alt="UPI Payment QR Code"
                    className="h-[200px] w-[200px] bg-white rounded-lg shadow-sm border border-slate-200"
                  />
                  <div className="flex gap-4 items-center justify-center mt-3 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
                    <span>GooglePay</span>
                    <span className="h-3 w-px bg-slate-300"></span>
                    <span>PhonePe</span>
                    <span className="h-3 w-px bg-slate-300"></span>
                    <span>Paytm</span>
                  </div>
                </>
              )}
            </div>

            {/* Bill Info */}
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs">
              <div className="text-left font-medium text-slate-500">
                <p>Merchant: <span className="text-slate-800 font-bold">Mini Glitz Ltd</span></p>
                <p className="text-[10px] text-slate-400">Ref: MG-${Date.now().toString().substring(6)}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400">Grand Total</p>
                <p className="text-pink-600 font-black text-sm">₹{grandTotal}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                disabled={verifyingPayment}
                onClick={() => {
                  setVerifyingPayment(true);
                  setTimeout(() => {
                    setVerifyingPayment(false);
                    setShowUpiModal(false);
                    processOrderPlacement("upi");
                  }, 2500);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <span>✓ I Have Paid / Simulate Success</span>
              </button>
              <button
                type="button"
                disabled={verifyingPayment}
                onClick={() => {
                  setShowUpiModal(false);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 text-xs rounded-xl transition cursor-pointer"
              >
                Cancel Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Support Assistant floating panel */}
      <AIChatBot />

      {/* Modern Professional Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-white py-12 mt-16 text-xs">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand col */}
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <span className="font-display font-black text-lg uppercase tracking-tight text-pink-600">
                MINI<span className="text-slate-400 font-light">GLITZ</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              India's favorite social commerce community marketplace. Zero shipping charges on all eligible festive items under ₹499.
            </p>
          </div>

          {/* Shoppers link */}
          <div>
            <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] mb-3">Popular Categories</h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li><button onClick={() => { setSelectedCategory("Ethnic Wear"); setActivePage("home"); }} className="hover:text-pink-400">Traditional Saree & Kurti</button></li>
              <li><button onClick={() => { setSelectedCategory("Beauty & Personal Care"); setActivePage("home"); }} className="hover:text-pink-400">Waterproof Lipsticks</button></li>
              <li><button onClick={() => { setSelectedCategory("Watches & Gadgets"); setActivePage("home"); }} className="hover:text-pink-400">Digital Smart Watches</button></li>
              <li><button onClick={() => { setSelectedCategory("Home & Kitchen"); setActivePage("home"); }} className="hover:text-pink-400">Designer Cotton Bedsheets</button></li>
            </ul>
          </div>

          {/* Suppliers link */}
          <div>
            <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] mb-3">Supplier Portal</h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li><button onClick={() => setActivePage("register")} className="hover:text-pink-400">Register as a Supplier</button></li>
              <li><button onClick={() => setActivePage("about")} className="hover:text-pink-400">Supplier payout schedules</button></li>
              <li><a href="/DEPLOYMENT_GUIDE.md" className="hover:text-pink-400 font-mono text-[10px]">DEPLOYMENT_GUIDE.md</a></li>
              <li><a href="/supabase-schema/schema.sql" className="hover:text-pink-400 font-mono text-[10px]">SUPABASE_SCHEMA.sql</a></li>
            </ul>
          </div>

          {/* Legal policy lines */}
          <div>
            <h4 className="font-bold text-slate-300 uppercase tracking-widest text-[10px] mb-3">Helpdesk Contacts</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Email Helpline: help@miniglitz.com<br />
              Corporate Phone: +91 80 6000 7000<br />
              Location: Outer Ring Road, Bengaluru, KA - 560103
            </p>
          </div>

        </div>

        {/* Inner margin label */}
        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800/80 pt-6 mt-8 flex flex-col md:flex-row md:items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>© 2026 Mini Glitz E-Commerce Store. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="font-semibold text-slate-400">Secure Checkout</span>
            <span className="font-semibold text-slate-400">Cash on Delivery Available</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
