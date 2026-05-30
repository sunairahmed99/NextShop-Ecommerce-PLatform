"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/dashboard.module.css";
import toast from "react-hot-toast";

export default function WebsiteSettingsPage() {
  const [formData, setFormData] = useState({
    siteName: "",
    footerDescription: "",
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    column1Title: "",
    column2Title: "",
    whatsappNumber: "",
    shippingFee: 150,
    freeShippingThreshold: 20000
  });
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data && !data.error) {
        setFormData({
          siteName: data.siteName || "",
          footerDescription: data.footerDescription || "",
          facebook: data.socialLinks?.facebook || "",
          twitter: data.socialLinks?.twitter || "",
          instagram: data.socialLinks?.instagram || "",
          linkedin: data.socialLinks?.linkedin || "",
          column1Title: data.footerLinks?.column1Title || "",
          column2Title: data.footerLinks?.column2Title || "",
          whatsappNumber: data.whatsappNumber || "",
          shippingFee: data.shippingFee ?? 150,
          freeShippingThreshold: data.freeShippingThreshold ?? 20000
        });
        if (data.logo?.url) setLogoPreview(data.logo.url);
      }
    } catch (error) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogo(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const data = new FormData();
    if (logo) data.append("logo", logo);
    data.append("siteName", formData.siteName);
    data.append("footerDescription", formData.footerDescription);
    data.append("whatsappNumber", formData.whatsappNumber);
    data.append("socialLinks", JSON.stringify({
      facebook: formData.facebook,
      twitter: formData.twitter,
      instagram: formData.instagram,
      linkedin: formData.linkedin
    }));
    data.append("footerLinks", JSON.stringify({
      column1Title: formData.column1Title,
      column2Title: formData.column2Title
    }));
    data.append("shippingFee", formData.shippingFee.toString());
    data.append("freeShippingThreshold", formData.freeShippingThreshold.toString());

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        toast.success("Website settings updated successfully!");
        fetchSettings();
      } else {
        toast.error("Failed to update settings");
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
            <span>🌐 Website Settings</span>
            <span className={styles.breadcrumb}>/ admin / settings</span>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection} style={{ gridTemplateColumns: "1fr", marginTop: "24px" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Global Site Configuration</div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '20px' }}>
            
            {/* Logo Section */}
            <div style={{ display: 'flex', gap: '30px', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px' }}>
              <div style={{ width: '120px', height: '120px', border: '2px dashed #2d303e', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>No Logo</span>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ color: '#9ca3af', marginBottom: '10px', display: 'block', fontWeight: '600' }}>Website Logo</label>
                <input type="file" onChange={handleFileChange} accept="image/*" style={{ color: '#9ca3af' }} />
                <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '8px' }}>Recommended size: 200x60px (PNG or SVG)</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div className={styles.inputGroup}>
                <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Site Name</label>
                <input type="text" name="siteName" value={formData.siteName} onChange={handleChange} style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }} />
              </div>
              <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
                <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Footer Description</label>
                <textarea name="footerDescription" value={formData.footerDescription} onChange={handleChange} rows={3} style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px', resize: 'none' }} />
              </div>
              <div className={styles.inputGroup}>
                <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>WhatsApp Number</label>
                <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} placeholder="e.g. +923123456789" style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }} />
                <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px' }}>Enter full number with country code (e.g., +923001234567)</p>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#2d303e', margin: '10px 0' }}></div>

            {/* Social Links */}
            <div>
              <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1rem' }}>Social Media Links</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className={styles.inputGroup}>
                  <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Facebook URL</label>
                  <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="https://facebook.com/..." style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div className={styles.inputGroup}>
                  <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Twitter URL</label>
                  <input type="text" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="https://twitter.com/..." style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div className={styles.inputGroup}>
                  <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Instagram URL</label>
                  <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="https://instagram.com/..." style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div className={styles.inputGroup}>
                  <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>LinkedIn URL</label>
                  <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="https://linkedin.com/..." style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }} />
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#2d303e', margin: '10px 0' }}></div>

            {/* Footer Column Titles */}
            <div>
              <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1rem' }}>Footer Column Titles</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className={styles.inputGroup}>
                  <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Column 1 Title (Quick Links)</label>
                  <input type="text" name="column1Title" value={formData.column1Title} onChange={handleChange} style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div className={styles.inputGroup}>
                  <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Column 2 Title (Information)</label>
                  <input type="text" name="column2Title" value={formData.column2Title} onChange={handleChange} style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }} />
                </div>
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: '#2d303e', margin: '10px 0' }}></div>

            {/* Shipping Configuration */}
            <div>
              <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '1rem' }}>Shipping Configuration</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className={styles.inputGroup}>
                  <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Standard Delivery Fee (Rs.)</label>
                  <input type="number" name="shippingFee" value={formData.shippingFee} onChange={handleChange} min="0" style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }} />
                </div>
                <div className={styles.inputGroup}>
                  <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Free Shipping Threshold (Rs.)</label>
                  <input type="number" name="freeShippingThreshold" value={formData.freeShippingThreshold} onChange={handleChange} min="0" style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }} />
                  <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '4px' }}>Orders above this amount will have free shipping.</p>
                </div>
              </div>
            </div>

            <div className={styles.submitContainer}>
              <button 
                type="submit" 
                disabled={saving}
                className={styles.settingsBtn}
              >
                {saving ? "Updating..." : "Update Website Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
