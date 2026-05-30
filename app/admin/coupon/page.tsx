"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/dashboard.module.css";

interface Coupon {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderAmount: number;
  maxOrderAmount: number | null;
  maxDiscountAmount: number | null;
  usageLimit: number;
  usedCount: number;
  perUserLimit: number;
  expiryDate: string;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  code: "",
  discountType: "percentage" as "percentage" | "fixed",
  discountValue: "",
  minOrderAmount: "0",
  maxOrderAmount: "",
  maxDiscountAmount: "",
  usageLimit: "1",
  perUserLimit: "1",
  expiryDate: "",
  isActive: "true",
};

export default function CouponPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterType, sortBy]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/coupon");
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
      const data = await res.json();
      if (Array.isArray(data)) setCoupons(data);
    } catch (error: any) {
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  // Computed filtered list
  const filteredCoupons = coupons
    .filter((c) => {
      const code = (c.code || "").toLowerCase();
      const matchesSearch = code.includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || c.isActive.toString() === filterStatus;
      const matchesType =
        filterType === "all" || c.discountType === filterType;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "expiry")
        return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      if (sortBy === "code") return (a.code || "").localeCompare(b.code || "");
      if (sortBy === "usage") return b.usedCount - a.usedCount;
      return 0;
    });

  const totalPages = Math.ceil(filteredCoupons.length / ITEMS_PER_PAGE);
  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      code: formData.code,
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      maxOrderAmount: formData.maxOrderAmount ? Number(formData.maxOrderAmount) : null,
      maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
      usageLimit: Number(formData.usageLimit) || 1,
      perUserLimit: Number(formData.perUserLimit) || 1,
      expiryDate: formData.expiryDate,
      isActive: formData.isActive === "true",
    };

    try {
      const url = editingCoupon
        ? `/api/admin/coupon/${editingCoupon._id}`
        : "/api/admin/coupon";
      const method = editingCoupon ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setEditingCoupon(null);
        setFormData(emptyForm);
        fetchCoupons();
      } else {
        alert(result.error || "Something went wrong");
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount),
      maxOrderAmount: coupon.maxOrderAmount != null ? String(coupon.maxOrderAmount) : "",
      maxDiscountAmount: coupon.maxDiscountAmount != null ? String(coupon.maxDiscountAmount) : "",
      usageLimit: String(coupon.usageLimit),
      perUserLimit: String(coupon.perUserLimit),
      expiryDate: new Date(coupon.expiryDate).toISOString().split("T")[0],
      isActive: String(coupon.isActive),
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupon/${id}`, { method: "DELETE" });
      if (res.ok) fetchCoupons();
      else alert("Failed to delete coupon");
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  const inputStyle = {
    backgroundColor: "#1a1b23",
    border: "1px solid #2d303e",
    padding: "10px",
    borderRadius: "6px",
    color: "#fff",
    outline: "none",
    width: "100%",
    fontSize: "0.875rem",
  };

  const labelStyle = { color: "#9ca3af", fontSize: "0.8rem", marginBottom: "4px", display: "block" as const };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.unifiedHeader}>
        <div className={styles.headerLeftArea}>
          <div className={styles.pageTitle}>
            <span>🎟️ Coupon Management</span>
            <span className={styles.breadcrumb}>/ admin / coupons</span>
          </div>
        </div>
        <div className={styles.headerRightArea}>
          <button className={styles.settingsBtn} onClick={openCreateModal}>
            + Add New Coupon
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className={styles.statsGrid}>
        {[
          { label: "Total Coupons", value: coupons.length, color: "#3b82f6", icon: "🎟️" },
          { label: "Active", value: coupons.filter((c) => c.isActive && !isExpired(c.expiryDate)).length, color: "#10b981", icon: "✅" },
          { label: "Expired", value: coupons.filter((c) => isExpired(c.expiryDate)).length, color: "#ef4444", icon: "⏰" },
          { label: "Total Used", value: coupons.reduce((acc, c) => acc + c.usedCount, 0), color: "#f59e0b", icon: "📊" },
        ].map((stat) => (
          <div key={stat.label} className={styles.card} style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: "#9ca3af", fontSize: "0.72rem", marginBottom: "6px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {stat.label}
                </div>
                <div style={{ color: stat.color, fontSize: "1.6rem", fontWeight: 700, lineHeight: 1 }}>
                  {stat.value}
                </div>
              </div>
              <span style={{ fontSize: "1.6rem", flexShrink: 0 }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className={styles.bottomSection} style={{ gridTemplateColumns: "1fr", marginTop: "24px" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Coupon List</div>

          <div className={styles.tableControls}>
            <input
              type="text"
              placeholder="Search by coupon code..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select className={styles.filterSelect} value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Types</option>
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed</option>
            </select>
            <select className={styles.filterSelect} value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="all">All Status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
            <select className={styles.filterSelect} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="expiry">Expiry Soon</option>
              <option value="code">Code: A-Z</option>
              <option value="usage">Most Used</option>
            </select>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Type</th>
                  <th>Discount</th>
                  <th>Min Order</th>
                  <th>Max Discount</th>
                  <th>Usage</th>
                  <th>Per User</th>
                  <th>Expiry</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                      Loading coupons...
                    </td>
                  </tr>
                ) : filteredCoupons.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
                      No coupons found.
                    </td>
                  </tr>
                ) : (
                  paginatedCoupons.map((coupon) => {
                    const expired = isExpired(coupon.expiryDate);
                    const usagePct = coupon.usageLimit > 0
                      ? Math.round((coupon.usedCount / coupon.usageLimit) * 100)
                      : 0;
                    return (
                      <tr key={coupon._id}>
                        {/* Code */}
                        <td>
                          <span style={{
                            fontFamily: "monospace",
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            color: "#a78bfa",
                            background: "rgba(167,139,250,0.1)",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            letterSpacing: "1px",
                          }}>
                            {coupon.code}
                          </span>
                        </td>
                        {/* Type */}
                        <td>
                          <span style={{
                            padding: "3px 8px",
                            borderRadius: "20px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            background: coupon.discountType === "percentage"
                              ? "rgba(59,130,246,0.15)"
                              : "rgba(245,158,11,0.15)",
                            color: coupon.discountType === "percentage" ? "#3b82f6" : "#f59e0b",
                          }}>
                            {coupon.discountType === "percentage" ? "%" : "₹"} {coupon.discountType}
                          </span>
                        </td>
                        {/* Discount Value */}
                        <td style={{ fontWeight: 700, color: "#10b981", fontSize: "1rem" }}>
                          {coupon.discountType === "percentage"
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}
                        </td>
                        {/* Min Order */}
                        <td style={{ color: "#9ca3af" }}>
                          {coupon.minOrderAmount > 0 ? `₹${coupon.minOrderAmount}` : "—"}
                        </td>
                        {/* Max Discount */}
                        <td style={{ color: "#9ca3af" }}>
                          {coupon.maxDiscountAmount ? `₹${coupon.maxDiscountAmount}` : "—"}
                        </td>
                        {/* Usage */}
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "0.8rem", color: "#fff" }}>
                              {coupon.usedCount} / {coupon.usageLimit}
                            </span>
                            <div style={{ height: "4px", background: "#2d303e", borderRadius: "4px", width: "80px" }}>
                              <div style={{
                                height: "100%",
                                width: `${usagePct}%`,
                                borderRadius: "4px",
                                background: usagePct >= 80 ? "#ef4444" : "#10b981",
                              }} />
                            </div>
                          </div>
                        </td>
                        {/* Per User */}
                        <td style={{ color: "#9ca3af" }}>{coupon.perUserLimit}x</td>
                        {/* Expiry */}
                        <td>
                          <span style={{ color: expired ? "#ef4444" : "#9ca3af", fontSize: "0.8rem" }}>
                            {expired ? "⚠️ " : ""}
                            {new Date(coupon.expiryDate).toLocaleDateString("en-IN", {
                              day: "2-digit", month: "short", year: "numeric"
                            })}
                          </span>
                        </td>
                        {/* Status */}
                        <td>
                          <span style={{
                            padding: "3px 10px",
                            borderRadius: "20px",
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            background: coupon.isActive && !expired
                              ? "rgba(16,185,129,0.15)"
                              : "rgba(239,68,68,0.15)",
                            color: coupon.isActive && !expired ? "#10b981" : "#ef4444",
                          }}>
                            {expired ? "Expired" : coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        {/* Actions */}
                        <td>
                          <div className={styles.actionBtns}>
                            <button onClick={() => handleEdit(coupon)} className={styles.editBtn}>
                              Edit
                            </button>
                            <button onClick={() => handleDelete(coupon._id)} className={styles.deleteBtn}>
                              Delete
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

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center",
          justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)", padding: "20px",
          overflowY: "auto",
        }}>
          <div className={styles.card} style={{ width: "100%", maxWidth: "620px", border: "1px solid #a78bfa", margin: "auto" }}>
            <div className={styles.cardTitle} style={{ color: "#a78bfa" }}>
              {editingCoupon ? "✏️ Edit Coupon" : "🎟️ Create New Coupon"}
            </div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

              {/* Code + Type */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Coupon Code *</label>
                  <input
                    type="text" name="code" value={formData.code}
                    onChange={handleInputChange} required placeholder="e.g. SAVE20"
                    style={{ ...inputStyle, textTransform: "uppercase", letterSpacing: "1px", fontFamily: "monospace", fontWeight: 700 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Discount Type *</label>
                  <select name="discountType" value={formData.discountType} onChange={handleInputChange} required style={inputStyle}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              {/* Discount Value + Expiry */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>
                    Discount Value * {formData.discountType === "percentage" ? "(%)" : "(₹)"}
                  </label>
                  <input
                    type="number" name="discountValue" value={formData.discountValue}
                    onChange={handleInputChange} required min={1} placeholder="e.g. 20"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Expiry Date *</label>
                  <input
                    type="date" name="expiryDate" value={formData.expiryDate}
                    onChange={handleInputChange} required
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Min Order + Max Order */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Min Order Amount (₹)</label>
                  <input
                    type="number" name="minOrderAmount" value={formData.minOrderAmount}
                    onChange={handleInputChange} min={0} placeholder="0"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Max Order Amount (₹) <span style={{ color: "#6b7280", fontSize: "0.7rem" }}>optional</span></label>
                  <input
                    type="number" name="maxOrderAmount" value={formData.maxOrderAmount}
                    onChange={handleInputChange} min={0} placeholder="No limit"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Max Discount Cap */}
              {formData.discountType === "percentage" && (
                <div>
                  <label style={labelStyle}>Max Discount Cap (₹) <span style={{ color: "#6b7280", fontSize: "0.7rem" }}>e.g. cap 20% at ₹3000</span></label>
                  <input
                    type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount}
                    onChange={handleInputChange} min={0} placeholder="No cap"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Usage Limit + Per User Limit */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={labelStyle}>Total Usage Limit</label>
                  <input
                    type="number" name="usageLimit" value={formData.usageLimit}
                    onChange={handleInputChange} min={1} placeholder="1"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Per User Limit</label>
                  <input
                    type="number" name="perUserLimit" value={formData.perUserLimit}
                    onChange={handleInputChange} min={1} placeholder="1"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>Status</label>
                <select name="isActive" value={formData.isActive} onChange={handleInputChange} style={inputStyle}>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                <button
                  type="submit" disabled={submitting}
                  className={styles.settingsBtn}
                  style={{ flex: 1, justifyContent: "center", backgroundColor: "#7c3aed" }}
                >
                  {submitting ? "Saving..." : editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setEditingCoupon(null); }}
                  style={{
                    flex: 1, backgroundColor: "transparent",
                    border: "1px solid #2d303e", color: "#fff",
                    borderRadius: "6px", cursor: "pointer", fontSize: "0.875rem",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
