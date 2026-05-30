const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
require("dotenv").config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this for production
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
mongoose.connect(process.env.DATABASE).then(() => {
  console.log("✅ Chat DB Connected");
}).catch(err => {
  console.error("❌ DB Error:", err);
});

// Define Schema here to keep it standalone
const ChatMessageSchema = new mongoose.Schema({
  senderId: String,
  receiverId: String,
  message: String,
  isAdmin: Boolean,
  timestamp: { type: Date, default: Date.now }
});
const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`Joined room: ${userId}`);
  });

  socket.on("sendMessage", async (data) => {
    const { senderId, receiverId, text, isAdmin } = data;
    
    try {
      await ChatMessage.create({
        senderId,
        receiverId,
        message: text,
        isAdmin: !!isAdmin
      });
      console.log("Message saved");
    } catch (err) {
      console.error("Save error:", err);
    }

    io.to(receiverId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
  });
});

const PORT = 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket Server running on http://localhost:${PORT}`);
});
