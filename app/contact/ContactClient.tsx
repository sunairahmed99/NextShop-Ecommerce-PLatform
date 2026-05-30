"use client";

import React, { useState, useEffect } from 'react';
import styles from '../styles/contact.module.css';
import Reveal from '../Components/Reveal';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactInfo, setContactInfo] = useState<any>(null);
  const [banner, setBanner] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const { data } = await axios.get('/api/contact-info');
        setContactInfo(data);
      } catch (error) {
        console.error("Failed to fetch contact info");
      }
    };

    const fetchBanner = async () => {
      try {
        const { data } = await axios.get('/api/banners');
        if (data && data.length > 0) {
          setBanner(data[0].image?.url || '');
        }
      } catch (error) {
        console.error("Failed to fetch banners");
      }
    };

    fetchInfo();
    fetchBanner();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('/api/contact', formData);
      if (data.success) {
        toast.success(data.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.message);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.contactContainer}>
      <header 
        className={styles.heroSection}
        style={{ 
          backgroundImage: banner ? `linear-gradient(rgba(15, 16, 22, 0.7), rgba(15, 16, 22, 0.7)), url(${banner})` : '',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <Reveal>
          <span className={styles.heroSubtitle}>Get in Touch</span>
          <h1 className={styles.heroTitle}>Contact Us</h1>
        </Reveal>
      </header>

      <div className={styles.contentWrapper}>
        {/* Contact Information */}
        <Reveal threshold={0.1}>
          <div className={styles.infoSection}>
            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className={styles.infoText}>
                <h3>Phone</h3>
                <p>{contactInfo?.phone1 || '+92 300 1234567'}</p>
                <p>{contactInfo?.phone2 || '+92 311 7654321'}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className={styles.infoText}>
                <h3>Email</h3>
                <p>{contactInfo?.email1 || 'support@premiumstore.com'}</p>
                <p>{contactInfo?.email2 || 'info@premiumstore.com'}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className={styles.infoText}>
                <h3>Address</h3>
                <p>{contactInfo?.address || '123 Luxury Avenue, Fashion District'}</p>
                <p>{contactInfo?.city || 'Karachi, Pakistan'}</p>
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.iconWrapper}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div className={styles.infoText}>
                <h3>Business Hours</h3>
                <p>{contactInfo?.workingDays || 'Mon - Fri'}: {contactInfo?.workingHours || '9:00 AM - 9:00 PM'}</p>
                <p>{contactInfo?.weekendDays || 'Sat - Sun'}: {contactInfo?.weekendHours || '10:00 AM - 6:00 PM'}</p>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Contact Form */}
        <Reveal threshold={0.1}>
          <div className={styles.formSection}>
            <h2 className={styles.formTitle}>Send us a Message</h2>
            <form className={styles.contactForm} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="name">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  placeholder="Enter your name" 
                  className={styles.inputField}
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Enter your email" 
                  className={styles.inputField}
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="subject">Subject</label>
                <input 
                  type="text" 
                  id="subject" 
                  placeholder="What is this about?" 
                  className={styles.inputField}
                  value={formData.subject}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="message">Your Message</label>
                <textarea 
                  id="message" 
                  rows={5} 
                  placeholder="How can we help you?" 
                  className={styles.inputField}
                  value={formData.message}
                  onChange={handleChange}
                ></textarea>
              </div>

              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          </div>
        </Reveal>
      </div>

      {/* Map Section */}
      <div className={styles.contentWrapper} style={{ marginTop: '40px' }}>
        <Reveal threshold={0.05} style={{ gridColumn: '1 / -1' }}>
          <div className={styles.mapSection}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d231505.51433215264!2d66.86242398438102!3d24.95679549925232!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33e06602d4ca7%3A0xad63556734c264!2sKarachi%2C%20Karachi%20City%2C%20Sindh!5e0!3m2!1sen!2spk!4v1715519448328!5m2!1sen!2spk" 
              width="100%" 
              height="450" 
              style={{ border: 0, borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
