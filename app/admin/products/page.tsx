"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/dashboard.module.css";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  discountPrice: number;
  categoryId: { _id: string; name: string };
  brand?: string;
  sku?: string;
  images: { url: string; public_id: string }[];
  thumbnail?: { url: string; public_id: string };
  colors: string[];
  sizes: { size: string; qty: number }[];
  totalQty: number;
  ptype: string;
  isPublished: boolean;
  createdAt: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Static Data
  const AVAILABLE_COLORS = ["Red", "Blue", "Black", "White", "Green", "Yellow", "Silver", "Gold", "Pink", "Purple", "Grey", "Brown", "Orange"];
  const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "One Size"];

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    discount: "0",
    categoryId: "",
    brand: "",
    sku: "",
    ptype: "recent",
    isPublished: "true",
    colors: [] as string[],
    sizes: [] as { size: string; qty: number }[],
    images: [] as File[],
  });
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setShowColorDropdown(false);
      }
      if (sizeDropdownRef.current && !sizeDropdownRef.current.contains(event.target as Node)) {
        setShowSizeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus, sortBy]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/category"),
      ]);

      if (prodRes.ok) setProducts(await prodRes.json());
      if (catRes.ok) setCategories(await catRes.json());
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Compute Filtered Products
  const filteredProducts = products
    .filter((p) => {
      const name = p.name || "";
      const sku = p.sku || "";
      const brand = p.brand || "";
      const search = searchTerm.toLowerCase();

      const matchesSearch = name.toLowerCase().includes(search) || 
                           sku.toLowerCase().includes(search) ||
                           brand.toLowerCase().includes(search);
      const matchesCategory = filterCategory === "all" || p.categoryId?._id === filterCategory;
      const matchesStatus = filterStatus === "all" || p.isPublished.toString() === filterStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "price-low") return a.discountPrice - b.discountPrice;
      if (sortBy === "price-high") return b.discountPrice - a.discountPrice;
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return 0;
    });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData((prev) => ({ ...prev, images: Array.from(e.target.files!) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    data.append("price", formData.price);
    data.append("discount", formData.discount);
    data.append("categoryId", formData.categoryId);
    data.append("brand", formData.brand);
    data.append("sku", formData.sku);
    data.append("ptype", formData.ptype);
    data.append("isPublished", formData.isPublished);

    // Process arrays
    data.append("colors", JSON.stringify(formData.colors));
    data.append("sizes", JSON.stringify(formData.sizes));

    formData.images.forEach((file) => {
      data.append("images", file);
    });

    try {
      const url = editingProduct ? `/api/admin/products/${editingProduct._id}` : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, { method, body: data });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingProduct(null);
        fetchData();
        alert(editingProduct ? "Product updated!" : "Product created!");
      } else {
        const err = await res.json();
        alert(err.error || "Something went wrong");
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount: product.discount.toString(),
      categoryId: product.categoryId?._id || "",
      brand: product.brand || "",
      sku: product.sku || "",
      ptype: product.ptype,
      isPublished: product.isPublished.toString(),
      colors: product.colors || [],
      sizes: product.sizes || [],
      images: [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.unifiedHeader}>
        <div className={styles.headerLeftArea}>
          <div className={styles.pageTitle}>
            <span>🛍️ Product Management</span>
            <span className={styles.breadcrumb}>/ admin / products</span>
          </div>
        </div>
        <div className={styles.headerRightArea}>
          <button className={styles.settingsBtn} onClick={() => setIsModalOpen(true)}>
            + Add New Product
          </button>
        </div>
      </div>

      <div className={styles.bottomSection} style={{ gridTemplateColumns: "1fr", marginTop: "24px" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Product List</div>
          
          <div className={styles.tableControls}>
            <input 
              type="text" 
              placeholder="Search products, SKU or brand..." 
              className={styles.searchInput} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className={styles.filterSelect}
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
            </select>
            <select 
              className={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="true">Live</option>
              <option value="false">Draft</option>
            </select>
            <select 
              className={styles.filterSelect}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A-Z</option>
            </select>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Colors</th>
                  <th>Stock</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} style={{ textAlign: "center" }}>Loading...</td></tr>
                ) : filteredProducts.length === 0 ? (
                  <tr><td colSpan={11} style={{ textAlign: "center" }}>No products found.</td></tr>
                ) : (
                  paginatedProducts.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <img
                          src={product.thumbnail?.url || "/placeholder.png"}
                          alt={product.name}
                          className={styles.productImg}
                        />
                      </td>
                      <td style={{ color: "#fff", fontWeight: "600", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {product.name}
                      </td>
                      <td style={{ color: "#9ca3af" }}>{product.categoryId?.name || "N/A"}</td>
                      <td style={{ color: "#9ca3af" }}>{product.brand || "-"}</td>
                      <td style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{product.sku || "-"}</td>
                      <td>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ color: "#10b981", fontWeight: "bold" }}>${product.discountPrice.toFixed(2)}</span>
                          {product.discount > 0 && (
                            <span style={{ color: "#ef4444", fontSize: "0.65rem", textDecoration: "line-through" }}>${product.price}</span>
                          )}
                        </div>
                      </td>
                      <td style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", gap: "4px" }}>
                          {product.colors.map((c, i) => (
                            <span key={i} style={{ fontSize: "0.7rem", color: "#9ca3af" }}>{c}{i < product.colors.length - 1 ? "," : ""}</span>
                          ))}
                        </div>
                      </td>
                      <td style={{ color: "#fff" }}>{product.totalQty}</td>
                      <td>
                        <span style={{ fontSize: "0.75rem", color: "#3b82f6", textTransform: "capitalize" }}>{product.ptype}</span>
                      </td>
                      <td>
                        <span style={{ 
                          padding: "2px 6px", 
                          borderRadius: "10px", 
                          fontSize: "0.65rem", 
                          backgroundColor: product.isPublished ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)",
                          color: product.isPublished ? "#10b981" : "#ef4444"
                        }}>
                          {product.isPublished ? "Live" : "Draft"}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionBtns}>
                          <button onClick={() => handleEdit(product)} className={styles.editBtn}>Edit</button>
                          <button onClick={() => handleDelete(product._id)} className={styles.deleteBtn}>Delete</button>
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

      {/* Product Modal */}
      {isModalOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "20px" }}>
          <div className={styles.card} style={{ width: "100%", maxWidth: "800px", border: "1px solid #3b82f6", margin: "auto" }}>
            <div className={styles.cardTitle}>{editingProduct ? "Edit Product" : "Add New Product"}</div>
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* Basic Info Row */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "15px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Product Name</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} required style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Price ($)</label>
                  <input type="number" name="price" value={formData.price} onChange={handleInputChange} required style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Discount (%)</label>
                  <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", outline: "none" }} />
                </div>
              </div>

              {/* Category & Brand Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Category</label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} required style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", outline: "none" }}>
                    <option value="">Select Category</option>
                    {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Brand</label>
                  <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", outline: "none" }} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>SKU</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleInputChange} style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", outline: "none" }} />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} required rows={3} style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", outline: "none", resize: "none" }} />
              </div>

              {/* Colors & PType Row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "15px" }}>
                <div ref={colorDropdownRef} style={{ display: "flex", flexDirection: "column", gap: "4px", position: "relative" }}>
                  <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Available Colors</label>
                  <div 
                    onClick={() => setShowColorDropdown(!showColorDropdown)}
                    style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: "42px" }}
                  >
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.85rem", color: formData.colors.length > 0 ? "#fff" : "#9ca3af" }}>
                      {formData.colors.length > 0 ? formData.colors.join(", ") : "Select Colors..."}
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>▼</span>
                  </div>
                  
                  {showColorDropdown && (
                    <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, width: "150%", backgroundColor: "#1a1b23", border: "1px solid #2d303e", borderRadius: "6px", padding: "10px", zIndex: 10, display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: "200px", overflowY: "auto", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)" }}>
                      {AVAILABLE_COLORS.map(color => (
                        <label key={color} style={{ color: '#fff', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', border: formData.colors.includes(color) ? '1px solid #3b82f6' : '1px solid transparent' }}>
                          <input 
                            type="checkbox" 
                            style={{ display: 'none' }}
                            checked={formData.colors.includes(color)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, colors: [...prev.colors, color] }));
                              } else {
                                setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
                              }
                            }}
                          />
                          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color.toLowerCase() === 'white' ? '#f3f4f6' : color.toLowerCase(), border: '1px solid #4b5563' }} />
                          {color}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Display Type</label>
                  <select name="ptype" value={formData.ptype} onChange={handleInputChange} style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", outline: "none" }}>
                    <option value="recent">Recent</option>
                    <option value="featured">Featured</option>
                    <option value="best">Best Seller</option>
                  </select>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Status</label>
                  <select name="isPublished" value={formData.isPublished} onChange={handleInputChange} style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", outline: "none" }}>
                    <option value="true">Published</option>
                    <option value="false">Draft</option>
                  </select>
                </div>
              </div>

              {/* Sizes Management */}
              <div ref={sizeDropdownRef} style={{ display: "flex", flexDirection: "column", gap: "8px", position: "relative" }}>
                <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Sizes & Quantities</label>
                
                <div 
                  onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                  style={{ backgroundColor: "#1a1b23", border: "1px solid #2d303e", padding: "10px", borderRadius: "6px", color: "#fff", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span style={{ fontSize: "0.85rem", color: formData.sizes.length > 0 ? "#fff" : "#9ca3af" }}>
                    {formData.sizes.length > 0 ? `${formData.sizes.length} size(s) selected` : "Select Sizes..."}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>▼</span>
                </div>

                {showSizeDropdown && (
                  <div style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, width: "100%", backgroundColor: "#1a1b23", border: "1px solid #2d303e", borderRadius: "6px", padding: "15px", zIndex: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", maxHeight: "250px", overflowY: "auto", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)" }}>
                    {AVAILABLE_SIZES.map(size => {
                      const existingSize = formData.sizes.find(s => s.size === size);
                      const isSelected = !!existingSize;
                      
                      return (
                        <div key={size} style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: isSelected ? "rgba(59, 130, 246, 0.1)" : "rgba(255,255,255,0.02)", padding: "6px 10px", borderRadius: "6px", border: isSelected ? "1px solid #3b82f6" : "1px solid transparent", transition: 'all 0.2s' }}>
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", color: "#fff", fontSize: "0.8rem", width: '60px', fontWeight: isSelected ? 'bold' : 'normal' }}>
                            <input 
                              type="checkbox" 
                              style={{ cursor: "pointer" }}
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData(prev => ({ ...prev, sizes: [...prev.sizes, { size, qty: 0 }] }));
                                } else {
                                  setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s.size !== size) }));
                                }
                              }}
                            />
                            {size}
                          </label>
                          
                          {isSelected && (
                            <input 
                              type="number" 
                              placeholder="Qty" 
                              value={existingSize.qty === 0 ? "" : existingSize.qty}
                              min="0"
                              onChange={(e) => {
                                const val = e.target.value === "" ? 0 : parseInt(e.target.value) || 0;
                                setFormData(prev => ({
                                  ...prev,
                                  sizes: prev.sizes.map(s => s.size === size ? { ...s, qty: val } : s)
                                }));
                              }}
                              style={{ width: "60px", backgroundColor: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", padding: "4px 8px", borderRadius: "4px", color: "#fff", fontSize: "0.75rem", outline: "none" }}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Images Row */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "10px" }}>
                <label style={{ color: "#9ca3af", fontSize: "0.75rem" }}>Product Images</label>
                <div style={{ backgroundColor: "rgba(59, 130, 246, 0.05)", border: "1px dashed #3b82f6", padding: "12px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <input type="file" multiple onChange={handleFileChange} accept="image/*" style={{ color: "#9ca3af", fontSize: "0.8rem", width: "100%", cursor: "pointer" }} />
                </div>
                {editingProduct && <p style={{ color: "#6b7280", fontSize: "0.7rem" }}>Leave empty to keep existing images</p>}
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "10px" }}>
                <button type="submit" disabled={submitting} className={styles.settingsBtn} style={{ flex: 1, justifyContent: "center" }}>
                  {submitting ? "Processing..." : editingProduct ? "Update Product" : "Create Product"}
                </button>
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} style={{ flex: 1, backgroundColor: "transparent", border: "1px solid #2d303e", color: "#fff", borderRadius: "6px", cursor: "pointer" }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
