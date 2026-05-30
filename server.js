const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;

// Connect to MongoDB
mongoose.connect(process.env.DATABASE).then(() => {
  console.log("✅ MongoDB Connected via server.js");
}).catch(err => {
  console.error("❌ MongoDB Connection Error:", err);
});

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer);

  // Define Schema once outside the handler
  const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", new mongoose.Schema({
    senderId: String,
    receiverId: String,
    message: String,
    isAdmin: Boolean,
    timestamp: { type: Date, default: Date.now }
  }));

  io.on("connection", (socket) => {
    console.log("✅ Socket connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      console.log(`👤 User ${userId} joined room`);
    });

    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, text, isAdmin } = data;
      console.log("📩 Received sendMessage event:", data);
      
      try {
        const savedMsg = await ChatMessage.create({
          senderId,
          receiverId,
          message: text,
          isAdmin: !!isAdmin
        });
        console.log("💾 Message saved to DB:", savedMsg._id);
      } catch (err) {
        console.error("❌ Error saving message to DB:", err);
      }

      // Relay to the receiver
      io.to(receiverId).emit("receiveMessage", data);
      console.log(`📤 Message relayed to ${receiverId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
