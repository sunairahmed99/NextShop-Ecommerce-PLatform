"use client";

import React, { useState, useEffect } from "react";
import styles from "../styles/dashboard.module.css";
import toast from "react-hot-toast";

interface Contact {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy]);

  const fetchContacts = async () => {
    try {
      const res = await fetch("/api/admin/contacts");
      const data = await res.json();
      if (Array.isArray(data)) {
        setContacts(data);
      }
    } catch (error) {
      toast.error("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Inquiry deleted");
        fetchContacts();
      }
    } catch (error) {
      toast.error("Failed to delete inquiry");
    }
  };

  const filteredContacts = contacts
    .filter((c) => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return 0;
    });

  const totalPages = Math.ceil(filteredContacts.length / ITEMS_PER_PAGE);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className={styles.dashboard}>
      <div className={styles.unifiedHeader}>
        <div className={styles.headerLeftArea}>
          <div className={styles.pageTitle}>
            <span>📧 Contact Inquiries</span>
            <span className={styles.breadcrumb}>/ admin / contacts</span>
          </div>
        </div>
      </div>

      <div className={styles.bottomSection} style={{ gridTemplateColumns: "1fr", marginTop: "24px" }}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Inquiry Messages</div>

          <div className={styles.tableControls}>
            <input 
              type="text" 
              placeholder="Search by name, email or subject..." 
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
              <option value="name">Sender Name: A-Z</option>
            </select>
          </div>

          <div className={styles.tableResponsive}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Sender</th>
                  <th>Subject</th>
                  <th>Message</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ textAlign: "center" }}>Loading...</td></tr>
                ) : filteredContacts.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: "center" }}>No inquiries found.</td></tr>
                ) : (
                  paginatedContacts.map((contact) => (
                    <tr key={contact._id}>
                      <td>
                        <div style={{ color: "#fff", fontWeight: "600" }}>{contact.name}</div>
                        <div style={{ color: "#6b7280", fontSize: "0.8rem" }}>{contact.email}</div>
                      </td>
                      <td style={{ color: "#ec4899", fontWeight: "500" }}>{contact.subject}</td>
                      <td style={{ color: "#9ca3af", maxWidth: "400px" }}>
                        <div style={{ 
                          maxHeight: '60px', 
                          overflowY: 'auto', 
                          fontSize: '0.9rem',
                          lineHeight: '1.4',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {contact.message}
                        </div>
                      </td>
                      <td style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                        {new Date(contact.createdAt).toLocaleString()}
                      </td>
                      <td>
                        <button 
                          onClick={() => handleDelete(contact._id)} 
                          className={styles.deleteBtn}
                        >
                          Delete
                        </button>
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
    </div>
  );
}
