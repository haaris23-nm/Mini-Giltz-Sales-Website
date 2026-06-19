import React, { useState } from "react";
import { DbState, CATEGORIES } from "../data/mockDb";
import { User, Seller, Product, Category } from "../types";
import {
  Users,
  Building2,
  Package,
  FolderTree,
  TrendingUp,
  CreditCard,
  CheckCircle,
  XCircle,
  Trash2,
  Cpu,
  RefreshCw,
  Plus,
  Sparkles,
} from "lucide-react";

interface AdminDashboardProps {
  dbState: DbState;
  onApproveSeller: (sellerId: string) => void;
  onRejectSeller: (sellerId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onAddProduct: (product: Omit<Product, "id" | "sellerId" | "sellerName" | "ratings" | "reviewsCount" | "reviews" | "createdDate" | "updatedDate">) => void;
}

export default function AdminDashboard({
  dbState,
  onApproveSeller,
  onRejectSeller,
  onDeleteProduct,
  onAddProduct,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "sellers" | "products" | "categories">("analytics");

  // Admin Add Product Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProdName, setNewProdName] = useState("");
  const [newProdBrand, setNewProdBrand] = useState("");
  const [newProdPrice, setNewProdPrice] = useState<number>(499);
  const [newProdDiscount, setNewProdDiscount] = useState<number>(20);
  const [newProdStock, setNewProdStock] = useState<number>(50);
  const [newProdCategory, setNewProdCategory] = useState("Ethnic Wear");
  const [newProdDesc, setNewProdDesc] = useState("");
  const [newProdImageSeed, setNewProdImageSeed] = useState("saree");
  const [formSuccess, setFormSuccess] = useState(false);

  const handleAdminAddProductSubmit = (e: React.FormEvent) => {
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
      setShowAddForm(false);
    }, 2000);
  };

  // Calculations
  const totalSales = dbState.orders.filter(o => o.status !== "Cancelled").reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalOrders = dbState.orders.length;
  const activeSellers = dbState.sellers.filter(s => s.status === "approved").length;
  const pendingSellers = dbState.sellers.filter(s => s.status === "pending").length;
  const activeCustomers = dbState.users.filter(u => u.role === "customer").length;

  // Custom visual simple interactive chart specs
  const monthlyData = [
    { name: "Jan", val: 34000 },
    { name: "Feb", val: 45000 },
    { name: "Mar", val: 56000 },
    { name: "Apr", val: 78000 },
    { name: "May", val: 95000 },
    { name: "Jun", val: totalSales },
  ];
  const maxVal = Math.max(...monthlyData.map(d => d.val), 100000);

  return (
    <div id="admin-dashboard-container" className="py-8 px-4 animate-in fade-in duration-200">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            Platform Security & Admin Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Logged in as <span className="font-semibold text-pink-600">Super Admin</span>
          </p>
        </div>

        {/* Dashboard inner navigation tabs banner */}
        <div className="flex bg-slate-100 p-1 rounded-xl scrollbar-none overflow-x-auto whitespace-nowrap gap-1">
          <button
            id="adm-tab-analytics"
            onClick={() => setActiveTab("analytics")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "analytics" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 inline mr-1" />
            Platform Analytics
          </button>
          <button
            id="adm-tab-sellers"
            onClick={() => setActiveTab("sellers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
              activeTab === "sellers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Building2 className="h-3.5 w-3.5 inline mr-1" />
            Manage Sellers
            {pendingSellers > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-pink-600 text-[9px] text-white flex items-center justify-center rounded-full font-bold animate-pulse">
                {pendingSellers}
              </span>
            )}
          </button>
          <button
            id="adm-tab-products"
            onClick={() => setActiveTab("products")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "products" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="h-3.5 w-3.5 inline mr-1" />
            Products Gate
          </button>
          <button
            id="adm-tab-categories"
            onClick={() => setActiveTab("categories")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "categories" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <FolderTree className="h-3.5 w-3.5 inline mr-1" />
            Categories
          </button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center mb-2">
            <CreditCard className="h-4 w-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Sales GMV</span>
          <span className="text-xl font-bold text-slate-900 font-display">₹{totalSales.toLocaleString()}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-2">
            <Package className="h-4 w-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Total Orders</span>
          <span className="text-xl font-bold text-slate-900 font-display">{totalOrders}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Active Sellers</span>
          <span className="text-xl font-bold text-slate-900 font-display">{activeSellers}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
          <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2">
            <Users className="h-4 w-4" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Active Customers</span>
          <span className="text-xl font-bold text-slate-900 font-display">{activeCustomers}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs col-span-2 lg:col-span-1">
          <div className="h-8 w-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center mb-2">
            <Users className="h-4 w-4 animate-pulse" />
          </div>
          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Pending Registrations</span>
          <span className="text-xl font-bold text-slate-900 font-display">{pendingSellers}</span>
        </div>
      </div>

      {/* Main Container Views based on Selected Tab */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs min-h-[350px]">
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-800">Monthly GMV Growth Tracking</h2>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded font-semibold">+32% MoM</span>
            </div>

            {/* Custom Responsive SVG Chart */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-end h-48 w-full">
              <div className="flex items-end justify-between h-36 gap-2">
                {monthlyData.map((d, index) => {
                  const barHeightPercent = Math.round((d.val / maxVal) * 100);
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="text-[9px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white px-1.5 py-0.5 rounded -translate-y-1">
                        ₹{d.val.toLocaleString()}
                      </div>
                      <div
                        style={{ height: `${barHeightPercent}%` }}
                        className="w-full max-w-[40px] bg-pink-500 hover:bg-pink-600 rounded-t-lg transition-all duration-300 relative group-hover:shadow-lg"
                      ></div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{d.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform metrics and list tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top Performing Products</h3>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {dbState.products.slice(0, 3).map((p, idx) => (
                    <div key={p.id} className="p-3 flex items-center justify-between text-xs bg-white hover:bg-slate-50">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-400 w-4">{idx + 1}</span>
                        <img src={p.images[0]} alt="" referrerPolicy="no-referrer" className="h-8 w-8 rounded object-cover" />
                        <div>
                          <p className="font-medium text-slate-800 truncate max-w-[150px]">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-700">₹{p.price}</p>
                        <p className="text-[9px] text-green-600 font-semibold">{p.ratings} ★</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Active Registered Customers</h3>
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                  {dbState.users.filter(u => u.role === "customer").slice(0, 3).map((u) => (
                    <div key={u.id} className="p-3 flex items-center justify-between text-xs bg-white hover:bg-slate-50">
                      <div>
                        <p className="font-semibold text-slate-800">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(u.joinedAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "sellers" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Seller Registrations Approval Pipeline</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-3 font-semibold">Shop Name & Contact</th>
                    <th className="p-3 font-semibold">GSTIN ID</th>
                    <th className="p-3 font-semibold">Address</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbState.sellers.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{s.shopName}</p>
                        <p className="text-[10px] text-slate-400">{s.phone}</p>
                      </td>
                      <td className="p-3 font-mono text-slate-600">{s.gstin || "N/A (Pending input)"}</td>
                      <td className="p-3 text-slate-500 max-w-[200px] truncate">{s.address}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            s.status === "approved"
                              ? "bg-green-50 text-green-700"
                              : s.status === "rejected"
                              ? "bg-red-50 text-red-700"
                              : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {s.status === "pending" && (
                          <div className="flex justify-end gap-1.5">
                            <button
                              id={`act-appr-${s.id}`}
                              onClick={() => onApproveSeller(s.id)}
                              className="bg-green-600 hover:bg-green-700 text-white rounded p-1 hover:shadow-xs cursor-pointer"
                              title="Approve Seller"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              id={`act-rej-${s.id}`}
                              onClick={() => onRejectSeller(s.id)}
                              className="bg-red-600 hover:bg-red-700 text-white rounded p-1 hover:shadow-xs cursor-pointer"
                              title="Reject Seller"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        {s.status === "approved" && (
                          <span className="text-[10px] text-slate-400 font-semibold">Fully Eligible</span>
                        )}
                        {s.status === "rejected" && (
                          <span className="text-[10px] text-red-500 font-semibold">Blacklisted</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "products" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Platform Products Catalog</h2>
                <p className="text-[11px] text-slate-400">View, audit and manage live products online, or list new catalog items directly.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition hover:scale-[1.01] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                {showAddForm ? "Close Form" : "Add Direct Product"}
              </button>
            </div>

            {showAddForm && (
              <form onSubmit={handleAdminAddProductSubmit} className="space-y-4 max-w-2xl bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-6 animate-in slide-in-from-top-2 duration-200">
                <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase tracking-wider block w-max">
                  Admin Portal - Add New Product
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      placeholder="e.g. Pure Georgette Festive Saree"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Brand Name / Supplier label</label>
                    <input
                      type="text"
                      required
                      value={newProdBrand}
                      onChange={(e) => setNewProdBrand(e.target.value)}
                      placeholder="e.g. Mini Glitz Boutique"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Base Price (MRP in INR)</label>
                    <input
                      type="number"
                      required
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
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
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={newProdStock}
                      onChange={(e) => setNewProdStock(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Category Select</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Mock Image Seed (For design theme)</label>
                    <input
                      type="text"
                      value={newProdImageSeed}
                      onChange={(e) => setNewProdImageSeed(e.target.value)}
                      placeholder="e.g. saree, cosmetic, jewel"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
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
                    placeholder="Provide beautiful detailed specifications for customers..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                  />
                </div>

                {formSuccess && (
                  <div className="bg-green-50 text-green-700 border border-green-100 p-3 rounded-lg text-xs font-semibold animate-pulse flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>Product uploaded successfully to Mini Glitz store!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  List Product onto Catalog
                </button>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-3 font-semibold">Product</th>
                    <th className="p-3 font-semibold">Brand & Shop</th>
                    <th className="p-3 font-semibold">Price Details</th>
                    <th className="p-3 font-semibold">Stock status</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbState.products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="p-3 flex items-center gap-3">
                        <img src={p.images[0]} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded object-cover" />
                        <div>
                          <p className="font-bold text-slate-800">{p.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{p.category}</p>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="text-slate-700 font-semibold">{p.brand}</p>
                        <p className="text-[10px] text-slate-400">{p.sellerName}</p>
                      </td>
                      <td className="p-3">
                        <p className="font-bold text-slate-800">₹{Math.round(p.price * (1 - p.discountPercentage / 100))}</p>
                        <p className="text-[10px] text-slate-400 line-through">₹{p.price} ({p.discountPercentage}% off)</p>
                      </td>
                      <td className="p-3">
                        <span className={`font-semibold ${p.stockQuantity <= 5 ? "text-orange-600 font-bold" : "text-slate-500"}`}>
                          {p.stockQuantity} Left
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          id={`del-prod-${p.id}`}
                          onClick={() => onDeleteProduct(p.id)}
                          className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 p-2 rounded-lg cursor-pointer transition-colors"
                          title="Ban Product from Platform"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Active Marketplace Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dbState.products.reduce((acc: any[], curr) => {
                if (!acc.some(x => x.name === curr.category)) {
                  acc.push({ name: curr.category, count: 1 });
                } else {
                  const m = acc.find(x => x.name === curr.category);
                  if (m) m.count += 1;
                }
                return acc;
              }, []).map((cat, idx) => (
                <div key={idx} className="border border-slate-100 rounded-xl p-4 bg-slate-50 hover:bg-white transition-all">
                  <span className="text-xs font-bold text-pink-600 uppercase tracking-widest">Category</span>
                  <h3 className="font-bold text-slate-800 text-sm mt-1">{cat.name}</h3>
                  <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-400 font-semibold">Active Listings</span>
                    <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-0.5 rounded-full">
                      {cat.count} Items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
