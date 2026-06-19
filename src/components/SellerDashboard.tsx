import React, { useState } from "react";
import { User, Product, Order, OrderStatus } from "../types";
import { DbState, CATEGORIES } from "../data/mockDb";
import {
  TrendingUp,
  PackagePlus,
  Boxes,
  ClipboardList,
  DollarSign,
  Briefcase,
  AlertCircle,
  TrendingDown,
  Check,
  Truck,
  X,
  Sparkles,
  Plus,
} from "lucide-react";

interface SellerDashboardProps {
  currentUser: User;
  dbState: DbState;
  onAddProduct: (product: Omit<Product, "id" | "sellerId" | "sellerName" | "ratings" | "reviewsCount" | "reviews" | "createdDate" | "updatedDate">) => void;
  onUpdateStock: (productId: string, quantity: number) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

export default function SellerDashboard({
  currentUser,
  dbState,
  onAddProduct,
  onUpdateStock,
  onUpdateOrderStatus,
}: SellerDashboardProps) {
  const sellerId = currentUser.id;
  const sellerInfo = dbState.sellers.find(s => s.id === sellerId);

  const [activeTab, setActiveTab] = useState<"analytics" | "add-product" | "inventory" | "orders">("analytics");

  // Filter seller's own products and orders containing their products
  const sellerProducts = dbState.products.filter(p => p.sellerId === sellerId);
  const sellerOrders = dbState.orders.filter(o =>
    o.items.some(item => sellerProducts.some(sp => sp.id === item.productId))
  );

  // Stats calculation
  const totalSellerRevenue = sellerOrders
    .filter(o => o.status !== "Cancelled")
    .reduce((acc, curr) => {
      // Calculate revenue from seller's items in the order
      const sellerItemsTotal = curr.items
        .filter(item => sellerProducts.some(sp => sp.id === item.productId))
        .reduce((sum, item) => sum + item.price * (1 - item.discountPercentage / 100) * item.quantity, 0);
      return acc + sellerItemsTotal;
    }, 0);

  const pendingSellerOrdersCount = sellerOrders.filter(o => o.status === "Pending" || o.status === "Confirmed" || o.status === "Packed" || o.status === "Shipped").length;

  // New product form values
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdPrice, setNewProdPrice] = useState<number>(499);
  const [newProdDiscount, setNewProdDiscount] = useState<number>(20);
  const [newProdStock, setNewProdStock] = useState<number>(50);
  const [newProdCategory, setNewProdCategory] = useState("Ethnic Wear");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImageSeed, setNewProdImageSeed] = useState("saree_design");

  const [formSuccess, setFormSuccess] = useState(false);

  // Handle product listing submit
  const handleAddNewProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdBrand || !newProdDesc) return;

    onAddProduct({
      name: newProdName,
      brand: newProdBrand,
      price: Number(newProdPrice),
      discountPercentage: Number(newProdDiscount),
      stockQuantity: Number(newProdStock),
      category: newProdCategory,
      description: newProdDesc,
      images: [`https://picsum.photos/seed/${newProdImageSeed || "ethnic"}/600/600`],
    });

    setFormSuccess(true);
    setNewProdName("");
    setNewProdBrand("");
    setNewProdDesc("");

    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab("inventory");
    }, 2000);
  };

  return (
    <div id="seller-dashboard-container" className="py-8 px-4 animate-in fade-in duration-200">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Seller Dashboard: <span className="text-pink-600 font-bold">{sellerInfo?.shopName || "Registered Supplier"}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supplier Account Eligibility Status:{" "}
            <span className="font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full uppercase text-[10px]">
              {sellerInfo?.status || "Approved"}
            </span>
          </p>
        </div>

        {/* Dashboard Nav Selection Tab strip */}
        <div className="flex bg-slate-100 p-1 rounded-xl scrollbar-none overflow-x-auto whitespace-nowrap gap-1">
          <button
            id="sel-tab-analytics"
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "analytics" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 inline mr-1" />
            Shop Performance
          </button>
          <button
            id="sel-tab-add-product"
            onClick={() => setActiveTab("add-product")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "add-product" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <PackagePlus className="h-3.5 w-3.5 inline mr-1" />
            Add New Product
          </button>
          <button
            id="sel-tab-inventory"
            onClick={() => setActiveTab("inventory")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "inventory" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Boxes className="h-3.5 w-3.5 inline mr-1" />
            Inventory Stock
          </button>
          <button
            id="sel-tab-orders"
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
              activeTab === "orders" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <ClipboardList className="h-3.5 w-3.5 inline mr-1" />
            Customer Orders
            {pendingSellerOrdersCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-pink-600 text-[9px] text-white flex items-center justify-center rounded-full font-bold animate-ping">
                {pendingSellerOrdersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center mb-2">
            <DollarSign className="h-4 w-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Shop Revenue</span>
          <span className="text-xl font-bold text-slate-900 font-display">₹{totalSellerRevenue.toLocaleString()}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-2">
            <ClipboardList className="h-4 w-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Orders</span>
          <span className="text-xl font-bold text-slate-900 font-display">{sellerOrders.length}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Boxes className="h-4 w-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Active Products</span>
          <span className="text-xl font-bold text-slate-900 font-display">{sellerProducts.length} Listings</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mb-2">
            <AlertCircle className="h-4 w-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Pending Shipments</span>
          <span className="text-xl font-bold text-slate-900 font-display">{pendingSellerOrdersCount} Orders</span>
        </div>
      </div>

      {/* Tab Body views */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs min-h-[350px]">
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800">Monthly Product Performance Metrics</h2>
              <span className="text-xs font-semibold text-slate-400">Total Profit margin: ~18% after GST</span>
            </div>

            {/* Simulated custom SVG or compact graphics list highlighting performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Revenue share by products listed</h3>
                {sellerProducts.length === 0 ? (
                  <p className="text-slate-400 text-xs">No products listed yet to track performance.</p>
                ) : (
                  <div className="space-y-3.5">
                    {sellerProducts.slice(0, 4).map((p) => {
                      const sharePct = p.id === "prod-1" ? 70 : p.id === "prod-2" ? 20 : 10;
                      return (
                        <div key={p.id} className="text-xs">
                          <div className="flex justify-between mb-1.5 font-medium text-slate-700">
                            <span className="truncate max-w-[200px]">{p.name}</span>
                            <span>{sharePct}% Share</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${sharePct}%` }}
                              className="bg-pink-600 h-full rounded-full"
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-slate-700 text-xs uppercase mb-1">Supplier payout schedule</h4>
                  <p className="text-slate-500 text-[11xp] leading-relaxed">
                    Mini Glitz credits seller accounts safely on Wednesday of each week for all successful orders delivered preceding Sunday.
                  </p>
                </div>
                <div className="border-t border-slate-100/80 pt-3 mt-4 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Next Payout:</span>
                  <span className="font-bold text-slate-800">24 Jun, 2026</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "add-product" && (
          <form onSubmit={handleAddNewProductSubmit} className="space-y-4 max-w-2xl">
            <span className="text-xs font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Create New Listing
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. Pure Cotton Chikankari Kurti"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Brand Name / Supplier label</label>
                <input
                  type="text"
                  required
                  value={newProdBrand}
                  onChange={(e) => setNewProdBrand(e.target.value)}
                  placeholder="e.g. Surat Weaves"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Base Price (MRP in INR)</label>
                <input
                  type="number"
                  required
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Discount Percentage (0-95%)</label>
                <input
                  type="number"
                  min="0"
                  max="95"
                  value={newProdDiscount}
                  onChange={(e) => setNewProdDiscount(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Stock Quantity</label>
                <input
                  type="number"
                  required
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Category Select</label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Mock Image Seed (For placeholder styling)</label>
                <input
                  type="text"
                  value={newProdImageSeed}
                  onChange={(e) => setNewProdImageSeed(e.target.value)}
                  placeholder="e.g. silk_saree, lipstick, ring"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Product Description</label>
              <textarea
                required
                rows={3}
                value={newProdDesc}
                onChange={(e) => setNewProdDesc(e.target.value)}
                placeholder="Write detailed specifications (Material, Work type, size options, etc.)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
              />
            </div>

            {formSuccess && (
              <div className="bg-green-50 text-green-700 border border-green-100 p-3 rounded-lg text-xs font-semibold animate-pulse flex items-center gap-2">
                <Sparkles className="h-4 w-4 shrink-0" />
                <span>Product listing saved! Stock updated. Redirecting...</span>
              </div>
            )}

            <button
              id="submit-product-btn"
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              Upload Product and Go Live
            </button>
          </form>
        )}

        {activeTab === "inventory" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 mb-2">My Shop Stock Inventory Records</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-3 font-semibold">Product Name</th>
                    <th className="p-3 font-semibold">Category</th>
                    <th className="p-3 font-semibold">Active Price</th>
                    <th className="p-3 font-semibold">Stock status</th>
                    <th className="p-3 font-semibold text-right">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellerProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">No products uploaded yet.</td>
                    </tr>
                  ) : (
                    sellerProducts.map((p) => {
                      const netPrice = Math.round(p.price * (1 - p.discountPercentage / 100));
                      return (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="p-3 flex items-center gap-3">
                            <img src={p.images[0]} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded object-cover" />
                            <span className="font-bold text-slate-800 truncate max-w-[200px]" title={p.name}>{p.name}</span>
                          </td>
                          <td className="p-3 text-slate-500 font-semibold">{p.category}</td>
                          <td className="p-3 font-bold text-slate-800">₹{netPrice}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                p.stockQuantity === 0
                                  ? "bg-red-50 text-red-700"
                                  : p.stockQuantity < 10
                                  ? "bg-orange-50 text-orange-700"
                                  : "bg-green-50 text-green-700"
                              }`}
                            >
                              {p.stockQuantity === 0 ? "Out of Stock" : `${p.stockQuantity} in Stock`}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex justify-end items-center gap-1">
                              <button
                                onClick={() => onUpdateStock(p.id, -5)}
                                disabled={p.stockQuantity < 5}
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded font-bold disabled:opacity-50 cursor-pointer"
                              >
                                -5
                              </button>
                              <button
                                onClick={() => onUpdateStock(p.id, 10)}
                                className="bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded font-bold cursor-pointer"
                              >
                                +10
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Customer Order Dispatches</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-3 font-semibold">Order ID & Date</th>
                    <th className="p-3 font-semibold">Subscriber / Delivery Address</th>
                    <th className="p-3 font-semibold">Items listed by you</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Logistics Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellerOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">No active orders found for your shop yet.</td>
                    </tr>
                  ) : (
                    sellerOrders.map((o) => {
                      // get seller specific items in this order
                      const myItems = o.items.filter(item => sellerProducts.some(sp => sp.id === item.productId));
                      return (
                        <tr key={o.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono">
                            <p className="font-bold text-slate-800">{o.id}</p>
                            <p className="text-[10px] text-slate-400">
                              {new Date(o.createdDate).toLocaleDateString([], { month: "short", day: "numeric", hour: "2-digit" })}
                            </p>
                          </td>
                          <td className="p-3">
                            <p className="font-semibold text-slate-700">{o.customerName}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[150px]">{o.address}</p>
                          </td>
                          <td className="p-3 space-y-1">
                            {myItems.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                                <span className="font-bold">x{item.quantity}</span>
                                <span className="truncate max-w-[120px]">{item.name}</span>
                              </div>
                            ))}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                o.status === "Delivered"
                                  ? "bg-green-50 text-green-700"
                                  : o.status === "Cancelled"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-yellow-50 text-yellow-700"
                              }`}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {o.status === "Pending" && (
                              <button
                                onClick={() => onUpdateOrderStatus(o.id, "Confirmed")}
                                className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-[10px] py-1 px-2.5 rounded cursor-pointer"
                              >
                                Accept & Confirm
                              </button>
                            )}
                            {o.status === "Confirmed" && (
                              <button
                                onClick={() => onUpdateOrderStatus(o.id, "Packed")}
                                className="bg-slate-700 hover:bg-slate-800 text-white font-semibold text-[10px] py-1 px-2.5 rounded cursor-pointer"
                              >
                                Package Order
                              </button>
                            )}
                            {o.status === "Packed" && (
                              <button
                                onClick={() => onUpdateOrderStatus(o.id, "Shipped")}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[10px] py-1 px-2.5 rounded cursor-pointer flex items-center gap-1 ml-auto"
                              >
                                <Truck className="h-3.5 w-3.5" /> Handover to Courier
                              </button>
                            )}
                            {o.status === "Shipped" && (
                              <button
                                onClick={() => onUpdateOrderStatus(o.id, "Out for Delivery")}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[10px] py-1 px-2.5 rounded cursor-pointer"
                              >
                                Put Out for Delivery
                              </button>
                            )}
                            {o.status === "Out for Delivery" && (
                              <button
                                onClick={() => onUpdateOrderStatus(o.id, "Delivered")}
                                className="bg-green-600 hover:bg-green-700 text-white font-semibold text-[10px] py-1 px-2.5 rounded cursor-pointer flex items-center gap-1 ml-auto"
                              >
                                <Check className="h-3 w-3" /> Mark Delivered
                              </button>
                            )}
                            {o.status === "Delivered" && (
                              <span className="text-[10px] text-slate-400 font-bold">Successfully Dispatched</span>
                            )}
                            {o.status === "Cancelled" && (
                              <span className="text-[10px] text-red-400 font-bold">User Cancelled</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
