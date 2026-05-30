"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/dashboard.module.css";
import toast from "react-hot-toast";

export default function ContactInfoAdminPage() {
  const [formData, setFormData] = useState({
    phone1: "",
    phone2: "",
    email1: "",
    email2: "",
    address: "",
    city: "",
    workingDays: "",
    workingHours: "",
    weekendDays: "",
    weekendHours: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const res = await fetch("/api/contact-info");
      const data = await res.json();
      if (data && !data.error) {
        setFormData(data);
      }
    } catch (error) {
      toast.error("Failed to load contact info");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/contact-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Contact information updated successfully!");
      } else {
        toast.error("Failed to update contact info");
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
            <span>⚙️ Contact Settings</span>
            <span className={styles.breadcrumb}>/ admin / contact-info</span>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection} style={{ gridTemplateColumns: "1fr", marginTop: "24px" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Store Contact Details</div>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '20px' }}>
            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Primary Phone</label>
              <input 
                type="text" 
                name="phone1" 
                value={formData.phone1} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Secondary Phone</label>
              <input 
                type="text" 
                name="phone2" 
                value={formData.phone2} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Primary Email</label>
              <input 
                type="email" 
                name="email1" 
                value={formData.email1} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Secondary Email</label>
              <input 
                type="email" 
                name="email2" 
                value={formData.email2} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.inputGroup} style={{ gridColumn: 'span 2' }}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Full Address</label>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>City & Region</label>
              <input 
                type="text" 
                name="city" 
                value={formData.city} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.inputGroup}>
              {/* Empty for spacing */}
            </div>

            <div style={{ gridColumn: 'span 2', height: '1px', backgroundColor: '#2d303e', margin: '10px 0' }}></div>
            
            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Working Days (e.g. Mon - Fri)</label>
              <input 
                type="text" 
                name="workingDays" 
                value={formData.workingDays} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Working Hours</label>
              <input 
                type="text" 
                name="workingHours" 
                value={formData.workingHours} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Weekend Days (e.g. Sat - Sun)</label>
              <input 
                type="text" 
                name="weekendDays" 
                value={formData.weekendDays} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>
            <div className={styles.inputGroup}>
              <label style={{ color: '#9ca3af', marginBottom: '8px', display: 'block' }}>Weekend Hours</label>
              <input 
                type="text" 
                name="weekendHours" 
                value={formData.weekendHours} 
                onChange={handleChange} 
                style={{ width: '100%', padding: '12px', backgroundColor: '#1a1b23', border: '1px solid #2d303e', color: '#fff', borderRadius: '8px' }}
              />
            </div>

            <div className={styles.submitContainer}>
              <button 
                type="submit" 
                disabled={saving}
                className={styles.settingsBtn}
              >
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
