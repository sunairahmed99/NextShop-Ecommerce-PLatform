"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from '../styles/chat.module.css';
import { io, Socket } from 'socket.io-client';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

let socket: Socket;

export default function ChatButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { id: 1, text: "Hello! How can we help you today?", sender: "admin", time: "" }
  ]);
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch user profile to check if logged in
  const { data: profileData } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const { data } = await axios.get("/api/auth/profile");
      return data;
    },
    retry: false,
  });

  const isLoggedIn = !!profileData?.success && !!(profileData?.data || profileData?.user);
  const user = profileData?.data || profileData?.user;
  const userId = user?._id || "guest";

  // Fetch Chat History
  const { data: historyData } = useQuery({
    queryKey: ["chatHistory", userId],
    queryFn: async () => {
      if (userId === "guest") return { messages: [] };
      const { data } = await axios.get("/api/chat/history");
      return data;
    },
    enabled: isLoggedIn && userId !== "guest",
  });

  // Load History when data arrives
  useEffect(() => {
    if (historyData?.success && historyData.messages) {
      setChatHistory([
        {
          id: 1,
          text: "Hello! How can we help you today?",
          sender: "admin",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...historyData.messages
      ]);
    }
  }, [historyData]);

  useEffect(() => {
    setMounted(true);

    if (!isLoggedIn || userId === "guest") {
      if (socket) socket.disconnect();
      return;
    }

    const socketInitializer = async () => {
      socket = io();

      socket.on("connect", () => {

        socket.emit("join", userId);
      });

      socket.on("connect_error", (err) => {
        console.error("❌ Socket connection error:", err);
      });

      socket.on("receiveMessage", (data) => {

        setChatHistory(prev => [...prev, {
          id: Date.now(),
          text: data.text,
          sender: "admin",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      });
    };

    socketInitializer();

    return () => {
      if (socket) socket.disconnect();
    };
  }, [isLoggedIn, userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  if (!mounted || !pathname || pathname.startsWith('/admin')) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (userId === "guest" || !isLoggedIn) {
      toast.error("Please login to send messages");
      return;
    }

    if (!socket) {
      toast.error("Chat connection lost. Please refresh.");
      return;
    }

    const newMessage = {
      id: Date.now(),
      text: message,
      sender: "user",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Emit to socket FIRST or simultaneously with UI update


    socket.emit("sendMessage", {
      senderId: userId,
      receiverId: "admin",
      text: message,
      isAdmin: false
    });

    setChatHistory([...chatHistory, newMessage]);
    setMessage("");
  };

  return (
    <>
      {/* Floating Button */}
      <div
        className={styles.floatingBtn}
        onClick={() => {
          if (!isLoggedIn) {
            toast.error("Please login first to chat with admin");
            return;
          }
          setIsOpen(!isOpen);
        }}
        style={{ transform: isOpen ? 'rotate(90deg)' : 'none' }}
      >
        {isOpen ? (
          <span style={{ fontSize: '24px' }}>✕</span>
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        )}
      </div>

      {/* Chat Window */}
      <div className={`${styles.chatWindow} ${isOpen ? styles.chatWindowOpen : ''}`}>
        {/* Header */}
        <div className={styles.chatHeader}>
          <div className={styles.adminInfo}>
            <div className={styles.avatar}>A</div>
            <div>
              <div className={styles.adminName}>Support Admin</div>
              <div className={styles.onlineStatus}>
                <span className={styles.statusDot}></span> Online
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className={styles.messageList} ref={scrollRef}>
          {chatHistory.map((msg) => (
            <div key={msg.id} className={`${styles.messageWrapper} ${msg.sender === 'user' ? styles.userWrapper : styles.adminWrapper}`}>
              <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userBubble : styles.adminBubble}`}>
                {msg.text}
                <div className={styles.messageTime}>{msg.time}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form className={styles.chatInputArea} onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={styles.chatInput}
          />
          <button type="submit" className={styles.sendBtn}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
