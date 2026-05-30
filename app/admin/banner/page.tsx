"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/dashboard.module.css";

interface Banner {
  _id: string;
  title: string;
  description: string;
  image: {
    url: string;
    publicId: string;
  };
  createdAt: string;
}

export default function BannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: null as File | null,
  });
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banner");
      if (!res.ok) {
        throw new Error(`Failed to fetch banners: ${res.status}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setBanners(data);
      }
    } catch (error: any) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  // Compute Filtered Banners
  const filteredBanners = banners
    .filter((b) => (b.title || "").toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "name") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });

  const totalPages = Math.ceil(filteredBanners.length / ITEMS_PER_PAGE);
  const paginatedBanners = filteredBanners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    if (formData.image) {
      data.append("image", formData.image);
    }

    try {
      const url = editingBanner ? `/api/admin/banner/${editingBanner._id}` : "/api/admin/banner";
      const method = editingBanner ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        setIsModalOpen(false);
        setEditingBanner(null);
        setFormData({ title: "", description: "", image: null });
        fetchBanners();
      } else {
        alert(result.error || "Something went wrong");
      }
    } catch (error: any) {
      console.error("Error saving banner:", error);
      alert(`Error saving banner: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

    try {
      const res = await fetch(`/api/admin/banner/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchBanners();
      } else {
        alert("Failed to delete banner");
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.unifiedHeader}>
        <div className={styles.headerLeftArea}>
          <div className={styles.pageTitle}>
            <span>📢 Banner Management</span>
            <span className={styles.breadcrumb}>/ admin / banner</span>
          </div>
        </div>
        <div className={styles.headerRightArea}>
          <button
            className={styles.settingsBtn}
            onClick={() => {
              setEditingBanner(null);
              setFormData({ title: "", description: "", image: null });
              setIsModalOpen(true);
            }}
          >
            + Add New Banner
          </button>
        </div>
      </div>

      <div className={styles.bottomSection} style={{ gridTemplateColumns: "1fr", marginTop: "24px" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Banner List</div>

          <div className={styles.tableControls}>
            <input 
              type="text" 
              placeholder="Search banners..." 
              className={styles.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="name">Title: A-Z</option>
            </select>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ textAlign: "center" }}>Loading...</td></tr>
                ) : filteredBanners.length === 0 ? (
                  <tr><td colSpan={4} style={{ textAlign: "center" }}>No banners found.</td></tr>
                ) : (
                  paginatedBanners.map((banner) => (
                    <tr key={banner._id}>
                      <td>
                        <img
                          src={banner.image?.url || "/placeholder.png"}
                          alt={banner.title || "Banner"}
                          className={styles.bannerImg}
                        />
                      </td>
                      <td style={{ color: "#fff", fontWeight: "600", fontSize: "0.95rem" }}>{banner.title}</td>
                      <td style={{ color: "#9ca3af", maxWidth: "300px" }}>{banner.description}</td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button
                            onClick={() => handleEdit(banner)}
                            className={styles.editBtn}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(banner._id)}
                            className={styles.deleteBtn}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
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
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            backdropFilter: "blur(4px)"
          }}
        >
          <div className={styles.card} style={{ width: "100%", maxWidth: "500px", border: "1px solid #3b82f6" }}>
            <div className={styles.cardTitle}>{editingBanner ? "Edit Banner" : "Add New Banner"}</div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  style={{
                    backgroundColor: "#1a1b23",
                    border: "1px solid #2d303e",
                    padding: "10px",
                    borderRadius: "6px",
                    color: "#fff",
                    outline: "none"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  style={{
                    backgroundColor: "#1a1b23",
                    border: "1px solid #2d303e",
                    padding: "10px",
                    borderRadius: "6px",
                    color: "#fff",
                    outline: "none",
                    resize: "none"
                  }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Image</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*"
                  required={!editingBanner}
                  style={{
                    color: "#9ca3af",
                    fontSize: "0.875rem"
                  }}
                />
                {editingBanner && !formData.image && (
                  <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>Leave empty to keep current image</p>
                )}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.settingsBtn}
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {submitting ? "Saving..." : editingBanner ? "Update Banner" : "Create Banner"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    backgroundColor: "transparent",
                    border: "1px solid #2d303e",
                    color: "#fff",
                    borderRadius: "6px",
                    cursor: "pointer"
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
