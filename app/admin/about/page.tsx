"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/dashboard.module.css";
import toast from "react-hot-toast";

export default function AboutAdminPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAboutInfo();
  }, []);

  const fetchAboutInfo = async () => {
    try {
      const res = await fetch("/api/about");
      const data = await res.json();
      if (data && !data.error) {
        setFormData({
          title: data.title,
          description: data.description
        });
        setPreviewUrl(data.image?.url || "");
      }
    } catch (error) {
      toast.error("Failed to load about info");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      if (imageFile) {
        data.append("image", imageFile);
      }

      const res = await fetch("/api/about", {
        method: "PUT",
        body: data,
      });
      if (res.ok) {
        toast.success("About information updated successfully!");
        const updatedData = await res.json();
        setPreviewUrl(updatedData.image?.url || "");
        setImageFile(null);
      } else {
        toast.error("Failed to update about info");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#fff', padding: '40px' }}>Loading settings...</div>;

  return (
    <div className={styles.dashboard}>
      <div className={styles.unifiedHeader}>
        <div className={styles.headerLeftArea}>
          <div className={styles.pageTitle}>
            <span>ℹ️ About Settings</span>
            <span className={styles.breadcrumb}>/ admin / about</span>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection} style={{ gridTemplateColumns: "1fr", marginTop: "24px" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Edit About Page Content</div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '20px' }}>
            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Title</label>
              <input 
                type="text" 
                name="title" 
                value={formData.title} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Description</label>
              <textarea 
                name="description" 
                value={formData.description} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px', minHeight: '150px' }}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>About Image</label>
              <input 
                type="file" 
                onChange={handleFileChange} 
                accept="image/*"
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>

            {previewUrl && (
              <div style={{ marginTop: '10px' }}>
                <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Image Preview</label>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  style={{ maxWidth: '300px', borderRadius: '8px', border: '1px solid #2d303e' }} 
                />
              </div>
            )}

            <div className={styles.submitContainer}>
              <button 
                type="submit" 
                disabled={saving}
                className={styles.settingsBtn}
              >
                {saving ? "Saving..." : "Save About Content"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
