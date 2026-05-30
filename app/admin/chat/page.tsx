"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles/dashboard.module.css";
import chatStyles from "../../styles/adminChat.module.css";
import { io, Socket } from "socket.io-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

let socket: Socket; // Keep global or move to ref to avoid reconnection on every render

interface ChatUser {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

interface Message {
  id: string;
  text: string;
  sender: "admin" | "user";
  time: string;
}

export default function AdminChatPage() {
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null);
  const [message, setMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Fetch Conversations
  const { data: conversations = [], refetch: refetchConversations } = useQuery({
    queryKey: ["chatConversations"],
    queryFn: async () => {
      const { data } = await axios.get("/api/admin/chat/conversations");
      return data;
    }
  });

  // Fetch Messages for selected user
  useEffect(() => {
    if (selectedUser) {

      const fetchMsgs = async () => {
        try {
          const { data } = await axios.get(`/api/admin/chat/messages/${selectedUser.id}`);
          const msgArray = Array.isArray(data) ? data : (data?.messages || []);
          
          setMessages(msgArray.map((m: any) => ({
            id: m._id || Date.now() + Math.random(),
            text: m.message || m.text || "",
            sender: m.isAdmin ? "admin" : "user",
            time: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Recently"
          })));
        } catch (err) {
          // console.error("❌ Error fetching messages:", err);
          toast.error("Failed to load message history");
        }
      };
      fetchMsgs();
    } else {
      setMessages([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    setMounted(true);
    
    if (!socket) {
      socket = io();

      socket.on("connect", () => {

        socket.emit("join", "admin");
      });

      socket.on("connect_error", (err) => {
        // console.error("❌ Admin socket connection error:", err);
      });
    }

    // Set up message listener (remove old one first to avoid duplicates)
    socket.off("receiveMessage");
    socket.on("receiveMessage", (data) => {

      
      // We need to use the functional update for setMessages to get the latest state
      // and we need to check the current selectedUser using a closure-safe way
      // But since this useEffect runs on mount, we'll handle the selectedUser check inside the listener
      // However, it's better to update setMessages and then conditionally show it in UI
      // or use a ref for selectedUser. For simplicity, we'll just refetch if needed or update if ID matches.
      
      if (data.senderId !== "admin") {
        // Trigger a refetch of conversations to show last message in sidebar
        refetchConversations();
        
        // Add to messages if it's from the currently selected user
        // Note: Using a state variable in a socket listener inside useEffect([]) is tricky.
        // We'll use a simpler approach: always add if it's the right user, 
        // but we need to know who the right user is.
      }
    });

    return () => {
      // Don't disconnect here if we want to keep the connection alive across user selections
      // socket.disconnect();
    };
  }, [refetchConversations]);

  // Separate effect for message listener to handle selectedUser changes without reconnecting
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (data: any) => {
      if (selectedUser && (data.senderId === selectedUser.id || data.receiverId === selectedUser.id)) {
        setMessages(prev => {
          // Check if message already exists (to avoid duplicates from rapid events)
          const exists = prev.some(m => m.text === data.text && m.time === new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
          if (exists) return prev;
          
          return [...prev, {
            id: Date.now().toString(),
            text: data.text,
            sender: data.isAdmin ? "admin" : "user",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }];
        });
      }
    };

    socket.on("receiveMessage", handleReceive);
    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [selectedUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, selectedUser]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedUser) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: "admin",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages([...messages, newMessage]);

    // Emit to socket
    socket.emit("sendMessage", {
      senderId: "admin",
      receiverId: selectedUser.id,
      text: message,
      isAdmin: true
    });

    setMessage("");
  };

  if (!mounted) return null;

  return (
    <div className={styles.dashboard}>
      <div className={styles.unifiedHeader}>
        <div className={styles.headerLeftArea}>
          <div className={styles.pageTitle}>
            <span>💬 Live Support Chat</span>
            <span className={styles.breadcrumb}>/ admin / chat</span>
          </div>
        </div>
      </div>

      <div className={chatStyles.chatContainer}>
        {/* User List Sidebar */}
        <div className={`${chatStyles.sidebar} ${selectedUser ? chatStyles.sidebarHiddenMobile : ''}`}>
          <div className={chatStyles.sidebarHeader}>
            <input type="text" placeholder="Search conversations..." className={chatStyles.searchInput} />
          </div>
          <div className={chatStyles.userList}>
            {conversations.length > 0 ? conversations.map((user: ChatUser) => (
              <div 
                key={user.id} 
                className={`${chatStyles.userItem} ${selectedUser?.id === user.id ? chatStyles.activeUser : ""}`}
                onClick={() => setSelectedUser(user)}
              >
                <div className={chatStyles.avatar}>
                  {user.name[0]}
                  {user.online && <span className={chatStyles.onlineIndicator}></span>}
                </div>
                <div className={chatStyles.userInfo}>
                  <div className={chatStyles.userNameRow}>
                    <span className={chatStyles.userName}>{user.name}</span>
                    <span className={chatStyles.messageTime}>{user.time}</span>
                  </div>
                  <div className={chatStyles.lastMessageRow}>
                    <span className={chatStyles.lastMessage}>{user.lastMessage}</span>
                    {user.unread > 0 && <span className={chatStyles.unreadBadge}>{user.unread}</span>}
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>No active conversations</div>
            )}
          </div>
        </div>

        {/* Chat Window */}
        <div className={`${chatStyles.chatWindow} ${!selectedUser ? chatStyles.chatWindowHiddenMobile : ''}`}>
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className={chatStyles.windowHeader}>
                <div className={chatStyles.headerUserInfo}>
                  <button 
                    className={chatStyles.backButton} 
                    onClick={() => setSelectedUser(null)}
                  >
                    ←
                  </button>
                  <div className={chatStyles.avatar}>{selectedUser.name[0]}</div>
                  <div>
                    <div className={chatStyles.headerUserName}>{selectedUser.name}</div>
                    <div className={chatStyles.headerStatus}>{selectedUser.online ? "Online" : "Offline"}</div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className={chatStyles.messagesArea} ref={scrollRef}>
                {messages.map((msg) => (
                  <div key={msg.id} className={`${chatStyles.messageWrapper} ${msg.sender === "admin" ? chatStyles.adminWrapper : chatStyles.userWrapper}`}>
                    <div className={`${chatStyles.messageBubble} ${msg.sender === "admin" ? chatStyles.adminBubble : chatStyles.userBubble}`}>
                      {msg.text}
                      <div className={chatStyles.timeText}>{msg.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input Area */}
              <form className={chatStyles.inputArea} onSubmit={handleSend}>
                <input 
                  type="text" 
                  placeholder="Type a message..." 
                  className={chatStyles.messageInput} 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className={chatStyles.sendButton}>
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className={chatStyles.noChatSelected}>
              <div className={chatStyles.noChatIcon}>💬</div>
              <h3>Select a conversation to start chatting</h3>
              <p>Real-time customer support messages will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
