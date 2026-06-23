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
  Upload,
  X,
  Settings,
} from "lucide-react";

interface AdminDashboardProps {
  dbState: DbState;
  onApproveSeller: (sellerId: string) => void;
  onRejectSeller: (sellerId: string) => void;
  onDeleteProduct: (productId: string) => void;
  onAddProduct: (product: Omit<Product, "id" | "sellerId" | "sellerName" | "ratings" | "reviewsCount" | "reviews" | "createdDate" | "updatedDate">) => void;
  onAddCustomer: (customer: { name: string; email: string; phone: string; address: string; role: "customer" }) => void;
  onDeleteCustomer: (userId: string) => void;
  onEditCustomer: (userId: string, updatedDetails: { name: string; email: string; phone: string; address: string }) => void;
  onUpdateSettings: (settings: { upiId: string; qrMode: "dynamic" | "static"; qrImageUrl?: string }) => void;
  onUpdateAvailability: (productId: string, availability: "available" | "outofstock" | "unavailable") => void;
}

export default function AdminDashboard({
  dbState,
  onApproveSeller,
  onRejectSeller,
  onDeleteProduct,
  onAddProduct,
  onAddCustomer,
  onDeleteCustomer,
  onEditCustomer,
  onUpdateSettings,
  onUpdateAvailability,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"analytics" | "sellers" | "products" | "categories" | "customers" | "settings">("analytics");

  // Admin settings state
  const [settingsUpiId, setSettingsUpiId] = useState(dbState.settings?.upiId || "tamilveni2306@okaxis");
  const [settingsQrMode, setSettingsQrMode] = useState<"dynamic" | "static">(dbState.settings?.qrMode || "static");
  const [settingsQrImageUrl, setSettingsQrImageUrl] = useState(dbState.settings?.qrImageUrl || "/assets/payment_qr.png");
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      upiId: settingsUpiId,
      qrMode: settingsQrMode,
      qrImageUrl: settingsQrImageUrl
    });
    setSettingsSuccess(true);
    setTimeout(() => setSettingsSuccess(false), 2000);
  };

  // Admin Edit Customer Form State
  const [editingCustId, setEditingCustId] = useState<string | null>(null);
  const [editCustName, setEditCustName] = useState("");
  const [editCustEmail, setEditCustEmail] = useState("");
  const [editCustPhone, setEditCustPhone] = useState("");
  const [editCustAddress, setEditCustAddress] = useState("");
  const [editCustSuccess, setEditCustSuccess] = useState(false);

  const handleStartEditCustomer = (cust: User) => {
    setEditingCustId(cust.id);
    setEditCustName(cust.name);
    setEditCustEmail(cust.email);
    setEditCustPhone(cust.phone || "");
    setEditCustAddress(cust.address || "");
  };

  const handleCancelEditCustomer = () => {
    setEditingCustId(null);
  };

  const handleAdminEditCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustId || !editCustName || !editCustEmail || !editCustPhone || !editCustAddress) return;

    onEditCustomer(editingCustId, {
      name: editCustName,
      email: editCustEmail,
      phone: editCustPhone,
      address: editCustAddress,
    });

    setEditCustSuccess(true);
    setTimeout(() => {
      setEditCustSuccess(false);
      setEditingCustId(null);
    }, 1500);
  };

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
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  // Admin Add Customer Form State
  const [showAddCustForm, setShowAddCustForm] = useState(false);
  const [newCustName, setNewCustName] = useState("");
  const [newCustEmail, setNewCustEmail] = useState("");
  const [newCustPhone, setNewCustPhone] = useState("");
  const [newCustAddress, setNewCustAddress] = useState("");
  const [custFormSuccess, setCustFormSuccess] = useState(false);

  const handleAdminAddCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustEmail || !newCustPhone || !newCustAddress) return;

    onAddCustomer({
      name: newCustName,
      email: newCustEmail,
      phone: newCustPhone,
      address: newCustAddress,
      role: "customer"
    });

    setCustFormSuccess(true);
    setNewCustName("");
    setNewCustEmail("");
    setNewCustPhone("");
    setNewCustAddress("");

    setTimeout(() => {
      setCustFormSuccess(false);
      setShowAddCustForm(false);
    }, 2000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

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
      images: [uploadedImage || `https://picsum.photos/seed/${newProdImageSeed || "ethnic"}/600/600`],
    });

    setFormSuccess(true);
    setNewProdName("");
    setNewProdBrand("");
    setNewProdDesc("");
    setUploadedImage(null);

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
          <button
            id="adm-tab-customers"
            onClick={() => setActiveTab("customers")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "customers" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="h-3.5 w-3.5 inline mr-1" />
            Customers Gate
          </button>
          <button
            id="adm-tab-settings"
            onClick={() => setActiveTab("settings")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "settings" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Settings className="h-3.5 w-3.5 inline mr-1" />
            Platform Settings
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

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Product Image</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Image Upload Box */}
                      <div className="border-2 border-dashed border-slate-200 hover:border-pink-500 rounded-2xl p-4 transition-all flex flex-col items-center justify-center bg-white cursor-pointer relative min-h-[140px]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="text-center flex flex-col items-center gap-1.5 pointer-events-none">
                          <Upload className="h-5 w-5 text-pink-600" />
                          <span className="text-xs font-semibold text-slate-700">Click to upload image</span>
                          <span className="text-[10px] text-slate-400">Supports PNG, JPG, WEBP (Max 5MB)</span>
                        </div>
                      </div>
                      
                      {/* Preview / Fallback Box */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-center relative min-h-[140px]">
                        {uploadedImage ? (
                          <div className="relative w-full h-full flex flex-col items-center justify-center">
                            <img
                              src={uploadedImage}
                              alt="Upload preview"
                              className="max-h-[110px] rounded-lg object-contain border border-slate-100 shadow-sm"
                            />
                            <button
                              type="button"
                              onClick={() => setUploadedImage(null)}
                              className="absolute top-2 right-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-full p-1 cursor-pointer z-20"
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <span className="text-[9px] text-green-600 font-bold mt-1">✓ Custom Image Loaded</span>
                          </div>
                        ) : (
                          <div className="text-center w-full">
                            <span className="text-[10px] text-slate-400 font-semibold block uppercase mb-2">Or Use Placeholder Seed</span>
                            <input
                              type="text"
                              value={newProdImageSeed}
                              onChange={(e) => setNewProdImageSeed(e.target.value)}
                              placeholder="e.g. saree, cosmetic, jewel"
                              className="w-full max-w-[200px] mx-auto bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-center focus:outline-hidden focus:border-pink-500 transition-colors"
                            />
                            <span className="text-[9px] text-slate-400 block mt-2">
                              Preview: picsum.photos/seed/{newProdImageSeed || "ethnic"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
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
                        <div className="space-y-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-block ${
                              p.isUnavailable
                                ? "bg-slate-100 text-slate-600"
                                : p.stockQuantity === 0
                                ? "bg-red-50 text-red-700"
                                : p.stockQuantity < 10
                                ? "bg-orange-50 text-orange-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {p.isUnavailable ? "Currently Unavailable" : p.stockQuantity === 0 ? "Out of Stock" : `${p.stockQuantity} in Stock`}
                          </span>
                          <div className="flex items-center gap-1 mt-1 text-[9px]">
                            <button
                              onClick={() => onUpdateAvailability(p.id, "available")}
                              className={`px-1.5 py-0.5 rounded font-semibold cursor-pointer ${
                                !p.isUnavailable && p.stockQuantity > 0
                                  ? "bg-green-600 text-white"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                              title="Mark as Available"
                            >
                              Available
                            </button>
                            <button
                              onClick={() => onUpdateAvailability(p.id, "outofstock")}
                              className={`px-1.5 py-0.5 rounded font-semibold cursor-pointer ${
                                !p.isUnavailable && p.stockQuantity === 0
                                  ? "bg-orange-500 text-white"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                              title="Mark as Out of Stock"
                            >
                              Out
                            </button>
                            <button
                              onClick={() => onUpdateAvailability(p.id, "unavailable")}
                              className={`px-1.5 py-0.5 rounded font-semibold cursor-pointer ${
                                p.isUnavailable
                                  ? "bg-red-500 text-white"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                              title="Mark as Currently Unavailable"
                            >
                              Unavailable
                            </button>
                          </div>
                        </div>
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

        {activeTab === "customers" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <div>
                <h2 className="text-sm font-bold text-slate-800">Platform Registered Customers</h2>
                <p className="text-[11px] text-slate-400">View registered customers, or add new customers directly.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddCustForm(!showAddCustForm)}
                className="bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs transition hover:scale-[1.01] cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                {showAddCustForm ? "Close Form" : "Add New Customer"}
              </button>
            </div>

            {showAddCustForm && (
              <form onSubmit={handleAdminAddCustomerSubmit} className="space-y-4 max-w-2xl bg-slate-50/50 p-6 rounded-2xl border border-slate-100 mb-6 animate-in slide-in-from-top-2 duration-200">
                <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase tracking-wider block w-max">
                  Admin Portal - Add New Customer
                </span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Customer Full Name</label>
                    <input
                      type="text"
                      required
                      value={newCustName}
                      onChange={(e) => setNewCustName(e.target.value)}
                      placeholder="e.g. Roshni Patel"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={newCustEmail}
                      onChange={(e) => setNewCustEmail(e.target.value)}
                      placeholder="e.g. roshni@example.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={newCustPhone}
                      onChange={(e) => setNewCustPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Complete Delivery Address</label>
                  <textarea
                    required
                    rows={2}
                    value={newCustAddress}
                    onChange={(e) => setNewCustAddress(e.target.value)}
                    placeholder="Street, sector, housing complex, state & pin code..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                  />
                </div>

                {custFormSuccess && (
                  <div className="bg-green-50 text-green-700 border border-green-100 p-3 rounded-lg text-xs font-semibold animate-pulse flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>Customer registered successfully!</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Register Customer Profile
                </button>
              </form>
            )}

            {editingCustId && (
              <form onSubmit={handleAdminEditCustomerSubmit} className="space-y-4 max-w-2xl bg-slate-50/50 p-6 rounded-2xl border border-pink-200 mb-6 animate-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase tracking-wider block w-max">
                    Admin Portal - Edit Customer Profile
                  </span>
                  <button
                    type="button"
                    onClick={handleCancelEditCustomer}
                    className="text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Customer Full Name</label>
                    <input
                      type="text"
                      required
                      value={editCustName}
                      onChange={(e) => setEditCustName(e.target.value)}
                      placeholder="e.g. Roshni Patel"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editCustEmail}
                      onChange={(e) => setEditCustEmail(e.target.value)}
                      placeholder="e.g. roshni@example.com"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Contact Phone</label>
                    <input
                      type="tel"
                      required
                      value={editCustPhone}
                      onChange={(e) => setEditCustPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Complete Delivery Address</label>
                  <textarea
                    required
                    rows={2}
                    value={editCustAddress}
                    onChange={(e) => setEditCustAddress(e.target.value)}
                    placeholder="Street, sector, housing complex, state & pin code..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                  />
                </div>

                {editCustSuccess && (
                  <div className="bg-green-50 text-green-700 border border-green-100 p-3 rounded-lg text-xs font-semibold animate-pulse flex items-center gap-2">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    <span>Customer details updated successfully!</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelEditCustomer}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="p-3 font-semibold">Name & Contact</th>
                    <th className="p-3 font-semibold">Email</th>
                    <th className="p-3 font-semibold">Delivery Address</th>
                    <th className="p-3 font-semibold text-right">Registration Date</th>
                    <th className="p-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dbState.users.filter(u => u.role === "customer").map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-bold text-slate-800">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.phone}</p>
                      </td>
                      <td className="p-3 text-slate-600">{u.email}</td>
                      <td className="p-3 text-slate-500 max-w-[250px] truncate" title={u.address}>{u.address}</td>
                      <td className="p-3 text-right text-slate-400 font-mono">
                        {new Date(u.joinedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td className="p-3 text-right space-x-2.5 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleStartEditCustomer(u)}
                          className="text-pink-600 hover:text-pink-800 font-bold text-xs cursor-pointer inline-flex items-center gap-1 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete customer ${u.name}?`)) {
                              onDeleteCustomer(u.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 font-bold text-xs cursor-pointer inline-flex items-center gap-1 hover:underline"
                        >
                          <Trash2 className="h-3 w-3 inline" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dbState.users.filter(u => u.role === "customer").length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-slate-400">No registered customers found. Add some above!</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl">
            <div className="border-b border-slate-100 pb-3 mb-2">
              <h2 className="text-sm font-bold text-slate-800">Platform Settings</h2>
              <p className="text-[11px] text-slate-400">Configure system parameters, gateway modes, and platform settings.</p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full uppercase tracking-wider block w-max">
                UPI Payment Configuration
              </span>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Platform UPI ID / VPA Address</label>
                  <input
                    type="text"
                    required
                    value={settingsUpiId}
                    onChange={(e) => setSettingsUpiId(e.target.value)}
                    placeholder="e.g. tamilveni2306@okaxis"
                    className="w-full max-w-md bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This ID will be used to dynamically generate the payment QR code during checkout.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2.5">UPI QR Scanner Mode</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md text-xs">
                    <div
                      onClick={() => setSettingsQrMode("static")}
                      className={`border rounded-xl p-3.5 cursor-pointer flex items-start gap-2.5 transition-all bg-white ${
                        settingsQrMode === "static"
                          ? "border-pink-500 bg-pink-50/10 shadow-3xs"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={settingsQrMode === "static"}
                        onChange={() => {}}
                        className="mt-0.5 h-3.5 w-3.5 accent-pink-600"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800">Static Scan Image</h4>
                        <p className="text-slate-400 text-[10px] whitespace-normal mt-0.5">Displays the default static scan image you uploaded.</p>
                      </div>
                    </div>

                    <div
                      onClick={() => setSettingsQrMode("dynamic")}
                      className={`border rounded-xl p-3.5 cursor-pointer flex items-start gap-2.5 transition-all bg-white ${
                        settingsQrMode === "dynamic"
                          ? "border-pink-500 bg-pink-50/10 shadow-3xs"
                          : "border-slate-100 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        checked={settingsQrMode === "dynamic"}
                        onChange={() => {}}
                        className="mt-0.5 h-3.5 w-3.5 accent-pink-600"
                      />
                      <div>
                        <h4 className="font-bold text-slate-800">Dynamic QR Generator</h4>
                        <p className="text-slate-400 text-[10px] whitespace-normal mt-0.5">Generates a scannable QR link with the exact cart order total.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Static QR Scanner Image URL / Path</label>
                  <input
                    type="text"
                    required
                    value={settingsQrImageUrl}
                    onChange={(e) => setSettingsQrImageUrl(e.target.value)}
                    placeholder="e.g. /assets/payment_qr.png"
                    className="w-full max-w-md bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Provide the asset path or public web URL of your static payment scanner QR code.</p>
                </div>
              </div>

              {settingsSuccess && (
                <div className="bg-green-50 text-green-700 border border-green-100 p-3 rounded-lg text-xs font-semibold animate-pulse flex items-center gap-2 max-w-md">
                  <Sparkles className="h-4 w-4 shrink-0" />
                  <span>Platform settings saved successfully!</span>
                </div>
              )}

              <button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs py-2 px-5 rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <CheckCircle className="h-4 w-4" />
                Save Platform Settings
              </button>
            </form>

            {/* QR Code Preview Block */}
            <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50 flex items-center gap-5">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm shrink-0">
                {settingsQrMode === "static" ? (
                  <div className="w-[120px] h-[120px] bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                    <img
                      src={settingsQrImageUrl}
                      alt="Static Payment QR Code"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&margin=4&data=${encodeURIComponent(
                      `upi://pay?pa=${settingsUpiId}&pn=MiniGlitz&am=100&cu=INR`
                    )}`}
                    alt="Dynamic Payment QR Code"
                    className="w-[120px] h-[120px] rounded-lg shadow-sm border border-slate-100"
                  />
                )}
              </div>
              <div className="text-xs space-y-1.5">
                <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">Live QR Code Scanner Preview</h3>
                <p className="text-slate-500 font-medium">
                  {settingsQrMode === "static"
                    ? "Currently showing the custom static payment scanner image you provided."
                    : `Generating dynamic QR links pointing to: ${settingsUpiId}`}
                </p>
                <div className="flex gap-3 text-[10px] font-bold text-pink-600 bg-pink-50 py-1 px-2 rounded-lg w-max uppercase mt-1">
                  <span>Target UPI VPA: {settingsUpiId}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
