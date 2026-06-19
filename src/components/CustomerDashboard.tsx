import React, { useState } from "react";
import { User, Order, Product, Notification } from "../types";
import { DbState } from "../data/mockDb";
import {
  Package,
  MapPin,
  Bell,
  Star,
  CheckCircle,
  Clock,
  MapPinned,
  UserCheck,
  FileSpreadsheet,
  AlertCircle,
  X,
  CreditCard,
  Share2,
} from "lucide-react";

interface CustomerDashboardProps {
  currentUser: User;
  dbState: DbState;
  onUpdateAddress: (address: string, phone: string) => void;
  onAddReview: (productId: string, rating: number, comment: string) => void;
  onCancelOrder: (orderId: string) => void;
  onMarkNotificationRead: (notifId: string) => void;
}

export default function CustomerDashboard({
  currentUser,
  dbState,
  onUpdateAddress,
  onAddReview,
  onCancelOrder,
  onMarkNotificationRead,
}: CustomerDashboardProps) {
  const [activeTab, setActiveTab] = useState<"orders" | "profile" | "notifications">("orders");

  // Filter state
  const myOrders = dbState.orders.filter(o => o.customerId === currentUser.id);
  const myNotifications = dbState.notifications.filter(n => n.userId === currentUser.id);

  // Address form states
  const [editAddress, setEditAddress] = useState(currentUser.address);
  const [editPhone, setEditPhone] = useState(currentUser.phone);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Active reviews writing modal helper state
  const [reviewProdId, setReviewProdId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewAdded, setReviewAdded] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAddress(editAddress, editPhone);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewProdId) return;
    onAddReview(reviewProdId, reviewRating, reviewComment);
    setReviewComment("");
    setReviewAdded(true);
    setTimeout(() => {
      setReviewAdded(false);
      setReviewProdId(null);
    }, 1500);
  };

  // Status indexer for Order Status Visual Stepper
  const STATUSES = ["Pending", "Confirmed", "Packed", "Shipped", "Out for Delivery", "Delivered"];
  const getStatusStep = (status: string) => {
    const idx = STATUSES.indexOf(status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <div id="customer-dashboard-container" className="py-8 px-4 animate-in fade-in duration-200">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-900 tracking-tight">
            My Account Console
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Shopper Profile: <span className="font-semibold text-slate-800">{currentUser.name}</span> ({currentUser.email})
          </p>
        </div>

        {/* Dash inner tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl scrollbar-none gap-1 shrink-0">
          <button
            id="cust-tab-orders"
            onClick={() => setActiveTab("orders")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "orders" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Package className="h-3.5 w-3.5 inline mr-1" />
            My Orders
          </button>
          <button
            id="cust-tab-profile"
            onClick={() => setActiveTab("profile")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "profile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MapPin className="h-3.5 w-3.5 inline mr-1" />
            Addresses & Profile
          </button>
          <button
            id="cust-tab-notifs"
            onClick={() => setActiveTab("notifications")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer relative ${
              activeTab === "notifications" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Bell className="h-3.5 w-3.5 inline mr-1" />
            Alerts Center
            {myNotifications.filter(n => !n.isRead).length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-pink-600 text-[9px] text-white flex items-center justify-center rounded-full font-bold">
                {myNotifications.filter(n => !n.isRead).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Container box */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs min-h-[350px]">
        {activeTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Track & Review Purchases</h2>

            {myOrders.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Package className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 text-xs">You haven't purchased anything yet!</p>
              </div>
            ) : (
              <div className="space-y-6">
                {myOrders.map((order) => {
                  const currentStep = getStatusStep(order.status);
                  const isDelivered = order.status === "Delivered";
                  const isCancelled = order.status === "Cancelled";

                  return (
                    <div
                      key={order.id}
                      className="border border-slate-100 rounded-xl p-5 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      {/* Order info header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4 text-xs">
                        <div className="space-y-0.5">
                          <p className="font-mono font-bold text-slate-800">
                            Order ID: <span className="text-pink-600">{order.id}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Payment: <span className="font-semibold uppercase text-slate-600">{order.paymentMethod}</span> (Status: {order.paymentStatus})
                          </p>
                        </div>
                        <div className="md:text-right">
                          <p className="font-bold text-slate-800">Total: ₹{order.totalAmount}</p>
                          <p className="text-[10px] text-slate-400">
                            Placed on: {new Date(order.createdDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Items Row */}
                      <div className="space-y-3 mb-5">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs gap-3">
                            <div className="flex items-center gap-2.5">
                              <img src={item.image} alt="" referrerPolicy="no-referrer" className="h-10 w-10 randed object-cover rounded shadow-xs" />
                              <div>
                                <h4 className="font-semibold text-slate-800 truncate max-w-[200px] md:max-w-md">{item.name}</h4>
                                <p className="text-[10px] text-slate-400">Qty: {item.quantity} • Unit: ₹{Math.round(item.price * (1 - item.discountPercentage / 100))}</p>
                              </div>
                            </div>
                            {isDelivered && (
                              <button
                                id={`write-rev-${item.productId}`}
                                onClick={() => setReviewProdId(item.productId)}
                                className="text-[10px] text-pink-600 font-bold bg-pink-50 hover:bg-pink-100 border border-pink-100 rounded-full px-2.5 py-1 cursor-pointer flex items-center gap-1 shrink-0"
                              >
                                <Star className="h-3 w-3 fill-pink-600" /> Write Review
                              </button>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Step Tracker Visual Line */}
                      {!isCancelled && order.status !== "Returned" && (
                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mb-2">Live Delivery Timeline</p>
                          <div className="grid grid-cols-6 gap-1 md:gap-2">
                            {STATUSES.map((st, stepIdx) => {
                              const isActive = stepIdx <= currentStep;
                              return (
                                <div key={st} className="text-center group flex flex-col items-center">
                                  <div
                                    className={`h-4 w-4 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                      isActive ? "bg-pink-600 text-white shadow-xs" : "bg-slate-200 text-slate-400"
                                    }`}
                                  >
                                    {isActive ? "✓" : stepIdx + 1}
                                  </div>
                                  <span className="text-[8px] mt-1 font-semibold text-slate-400 group-hover:text-slate-800 hidden md:block">
                                    {st}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Cancel actions */}
                      {!isDelivered && !isCancelled && order.status !== "Returned" && (
                        <div className="flex justify-end gap-2 mt-4 text-xs">
                          {order.status === "Pending" && (
                            <button
                              id={`cancel-btn-${order.id}`}
                              onClick={() => {
                                if (confirm("Do you want to cancel this order?")) {
                                  onCancelOrder(order.id);
                                }
                              }}
                              className="text-red-600 hover:text-red-700 font-semibold bg-red-50 hover:bg-red-100 px-3 py-1 rounded cursor-pointer transition-colors"
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      )}

                      {isCancelled && (
                        <div className="bg-red-50 text-red-600 text-[10px] p-2 rounded-lg border border-red-100 font-semibold mt-3 flex items-center gap-1">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>This order was cancelled by you. Refund (if already transacted) has been dispatched.</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-xl">
            <h2 className="text-sm font-bold text-slate-800 mb-2">Manage Delivery Credentials</h2>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Delivery Recipient Name</label>
              <input
                type="text"
                disabled
                value={currentUser.name}
                className="w-full bg-slate-100 text-slate-400 border border-slate-200 rounded-xl px-3 py-2 text-xs cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Subscriber Phone Number</label>
              <input
                type="tel"
                required
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Shipping Destination Address</label>
              <textarea
                required
                rows={3}
                value={editAddress}
                onChange={(e) => setEditAddress(e.target.value)}
                placeholder="Write sector flat number block city and pin code"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
              />
            </div>

            {saveSuccess && (
              <div className="bg-green-50 text-green-700 border border-green-100 p-2.5 rounded-lg text-xs font-medium animate-pulse flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Shipping address details saved! Sticky across browser refresh.</span>
              </div>
            )}

            <button
              id="save-profile-btn"
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-xs cursor-pointer flex items-center gap-1"
            >
              <MapPinned className="h-3.5 w-3.5" /> Save Coordinates
            </button>
          </form>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-800 mb-2">My Dispatch & Coupon Alerts</h2>

            {myNotifications.length === 0 ? (
              <p className="text-slate-400 text-xs text-center py-10">No alerts today!</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {myNotifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 flex items-start justify-between gap-4 text-xs transition-colors rounded-lg mb-2 ${
                      n.isRead ? "bg-white border border-slate-100" : "bg-pink-50/40 border border-pink-100/30"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${n.isRead ? "bg-slate-300" : "bg-pink-600 animate-pulse"}`}></span>
                        <h4 className="font-bold text-slate-800">{n.title}</h4>
                      </div>
                      <p className="text-slate-500 leading-relaxed text-[11px] font-medium pl-4">{n.message}</p>
                    </div>

                    {!n.isRead && (
                      <button
                        onClick={() => onMarkNotificationRead(n.id)}
                        className="text-[10px] text-pink-600 hover:text-pink-700 bg-white border border-pink-100 rounded-full px-2.5 py-0.5 cursor-pointer font-bold shrink-0 transition"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Dialog writing Portal */}
      {reviewProdId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-800 text-sm">Review Product Purchase</h3>
              <button onClick={() => setReviewProdId(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">Select Star Rating count</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= reviewRating ? "fill-yellow-500 text-yellow-500" : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Written Feedback Comment</label>
                <textarea
                  required
                  rows={3}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience (sizing quality print and dispatch delivery)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-hidden focus:border-pink-500 focus:bg-white transition-colors"
                />
              </div>

              {reviewAdded && (
                <div className="bg-green-50 text-green-700 text-xs p-2.5 rounded-lg border border-green-100 font-semibold animate-bounce">
                  Review published! Average calculated in database catalog.
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewProdId(null)}
                  className="bg-slate-100 text-slate-700 py-1.5 px-3 rounded-lg font-semibold"
                >
                  Close
                </button>
                <button
                  id="submit-review-btn"
                  type="submit"
                  className="bg-pink-600 hover:bg-pink-700 text-white font-semibold py-1.5 px-4 rounded-lg shadow-xs cursor-pointer"
                >
                  Submit Star Rating
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
