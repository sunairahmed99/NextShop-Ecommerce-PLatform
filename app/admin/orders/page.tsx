"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/dashboard.module.css";

interface OrderItem {
  productId: { _id: string; name: string; slug: string; thumbnail?: { url: string } } | string;
  name: string;
  thumbnail: string;
  price: number;
  discountPrice: number;
  qty: number;
  selectedColor?: string;
  selectedSize?: string;
}

interface Order {
  _id: string;
  userId: { _id: string; name: string; email: string; phone?: string } | null;
  items: OrderItem[];
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
}

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  pending: { bg: "#1e1b10", color: "#f59e0b", border: "rgba(245, 158, 11, 0.3)" },
  confirmed: { bg: "#0d1a29", color: "#3b82f6", border: "rgba(59, 130, 246, 0.3)" },
  processing: { bg: "#1a1333", color: "#8b5cf6", border: "rgba(139, 92, 246, 0.3)" },
  shipped: { bg: "#0a2125", color: "#06b6d4", border: "rgba(6, 182, 212, 0.3)" },
  delivered: { bg: "#0a1f18", color: "#10b981", border: "rgba(16, 185, 129, 0.3)" },
  cancelled: { bg: "#250d0d", color: "#ef4444", border: "rgba(239, 68, 68, 0.3)" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/orders");
      if (res.ok) setOrders(await res.json());
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder?._id === orderId) {
          setSelectedOrder((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchOrders();
        if (selectedOrder?._id === id) setSelectedOrder(null);
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const filteredOrders = orders
    .filter((o) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        o.fullName.toLowerCase().includes(search) ||
        o.email.toLowerCase().includes(search) ||
        o._id.toLowerCase().includes(search);
      const matchesStatus = filterStatus === "all" || o.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "total-high") return b.total - a.total;
      if (sortBy === "total-low") return a.total - b.total;
      return 0;
    });

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.unifiedHeader}>
        <div className={styles.headerLeftArea}>
          <div className={styles.pageTitle}>
            <span>📦 Order Management</span>
            <span className={styles.breadcrumb}>/ admin / orders</span>
          </div>
        </div>
        <div className={styles.headerRightArea}>
          <span style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
            Total: {orders.length} orders
          </span>
        </div>
      </div>

      <div className={styles.bottomSection} style={{ gridTemplateColumns: "1fr", marginTop: "24px" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>All Orders</div>

          <div className={styles.tableControls}>
            <input
              type="text"
              placeholder="Search by name, email or order ID..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="total-high">Total: High to Low</option>
              <option value="total-low">Total: Low to High</option>
            </select>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Products</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ textAlign: "center" }}>Loading...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: "center" }}>No orders found.</td></tr>
                ) : (
                  paginatedOrders.map((order) => {
                    const sc = statusColors[order.status] || statusColors.pending;
                    return (
                      <tr key={order._id}>
                        <td style={{ color: "#9ca3af", fontSize: "0.75rem", fontFamily: "monospace" }}>
                          #{order._id.slice(-6).toUpperCase()}
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            <span style={{ color: "#fff", fontWeight: "600", fontSize: "0.85rem" }}>{order.fullName}</span>
                            <span style={{ color: "#6b7280", fontSize: "0.7rem" }}>{order.email}</span>
                            <span style={{ color: "#3b82f6", fontSize: "0.7rem", marginTop: "2px" }}>{order.phone}</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "200px" }}>
                            {order.items.map((item, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <img 
                                  src={item.thumbnail} 
                                  alt={item.name} 
                                  style={{ width: "32px", height: "32px", borderRadius: "6px", objectFit: "cover", border: "1px solid rgba(255, 255, 255, 0.1)" }} 
                                />
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                  <span style={{ fontSize: "0.8rem", color: "#fff", fontWeight: "500", lineHeight: "1.2" }}>
                                    {item.name}
                                  </span>
                                  <span style={{ fontSize: "0.7rem", color: "#6b7280" }}>
                                    Qty: {item.qty} | Rs. {Math.round(item.discountPrice)}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td style={{ color: "#10b981", fontWeight: "bold" }}>Rs. {Math.round(order.total)}</td>
                        <td style={{ color: "#9ca3af", fontSize: "0.8rem" }}>{order.paymentMethod}</td>
                        <td>
                          <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                            style={{
                              backgroundColor: sc.bg,
                              color: sc.color,
                              border: `1px solid ${sc.border}`,
                              padding: "4px 8px",
                              borderRadius: "8px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                              textTransform: "capitalize",
                              cursor: "pointer",
                              outline: "none",
                            }}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                          {new Date(order.createdAt).toLocaleDateString("en-PK", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button onClick={() => setSelectedOrder(order)} className={styles.editBtn}>View</button>
                            <button onClick={() => handleDelete(order._id)} className={styles.deleteBtn}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px', padding: '10px' }}>
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{ backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', padding: '5px 12px', borderRadius: '6px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              
              <div style={{ display: 'flex', gap: '5px' }}>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{ 
                      backgroundColor: currentPage === i + 1 ? '#3b82f6' : '#1a1b23', 
                      border: '1px solid #2d303e', 
                      color: '#fff', 
                      width: '30px', 
                      height: '30px', 
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{ backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', padding: '5px 12px', borderRadius: '6px', opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center",
            justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "20px",
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className={styles.card}
            style={{ width: "100%", maxWidth: "700px", border: "1px solid #3b82f6", margin: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.cardTitle} style={{ marginBottom: "20px" }}>
              Order #{selectedOrder._id.slice(-6).toUpperCase()}
            </div>

            {/* Customer Info */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <h4 style={{ color: "#9ca3af", fontSize: "0.75rem", marginBottom: "6px" }}>CUSTOMER</h4>
                <p style={{ color: "#fff", fontWeight: "600" }}>{selectedOrder.fullName}</p>
                <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>{selectedOrder.email}</p>
                <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>{selectedOrder.phone}</p>
              </div>
              <div>
                <h4 style={{ color: "#9ca3af", fontSize: "0.75rem", marginBottom: "6px" }}>SHIPPING ADDRESS</h4>
                <p style={{ color: "#fff" }}>{selectedOrder.address}</p>
                <p style={{ color: "#9ca3af", fontSize: "0.85rem" }}>{selectedOrder.city}, {selectedOrder.zipCode}</p>
              </div>
            </div>

            {/* Items */}
            <h4 style={{ color: "#9ca3af", fontSize: "0.75rem", marginBottom: "10px" }}>ORDER ITEMS</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "10px" }}>
                  <img src={item.thumbnail || "/placeholder.png"} alt={item.name} style={{ width: "45px", height: "45px", borderRadius: "8px", objectFit: "cover" }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ color: "#fff", fontWeight: "600", fontSize: "0.85rem" }}>{item.name}</p>
                    <p style={{ color: "#6b7280", fontSize: "0.75rem" }}>
                      {item.qty} x Rs. {Math.round(item.discountPrice)}
                      {item.selectedSize ? ` | ${item.selectedSize}` : ""}
                      {item.selectedColor ? ` | ${item.selectedColor}` : ""}
                    </p>
                  </div>
                  <span style={{ color: "#10b981", fontWeight: "bold", fontSize: "0.85rem" }}>
                    Rs. {Math.round(item.discountPrice * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9ca3af" }}>Subtotal</span>
                <span style={{ color: "#fff" }}>Rs. {Math.round(selectedOrder.subtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#9ca3af" }}>Shipping</span>
                <span style={{ color: "#fff" }}>Rs. {Math.round(selectedOrder.shipping)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#10b981" }}>Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ""}</span>
                  <span style={{ color: "#10b981" }}>- Rs. {Math.round(selectedOrder.discount)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "10px", marginTop: "4px" }}>
                <span style={{ color: "#fff", fontWeight: "700", fontSize: "1.1rem" }}>Total</span>
                <span style={{ color: "#ec4899", fontWeight: "700", fontSize: "1.1rem" }}>Rs. {Math.round(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>Status:</span>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder._id, e.target.value)}
                  style={{
                    backgroundColor: statusColors[selectedOrder.status]?.bg || "#1a1b23",
                    color: statusColors[selectedOrder.status]?.color || "#fff",
                    border: `1px solid ${statusColors[selectedOrder.status]?.border || "transparent"}`,
                    padding: "6px 12px", borderRadius: "8px",
                    fontSize: "0.8rem", fontWeight: "600", textTransform: "capitalize", cursor: "pointer", outline: "none",
                  }}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ backgroundColor: "transparent", border: "1px solid #2d303e", color: "#fff", padding: "8px 20px", borderRadius: "8px", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
