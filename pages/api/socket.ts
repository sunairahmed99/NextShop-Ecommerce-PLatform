import { Server } from "socket.io";
import { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";

const ChatMessageSchema = new mongoose.Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

const ChatMessage = mongoose.models.ChatMessage || mongoose.model("ChatMessage", ChatMessageSchema);

export default function SocketHandler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      socket.on("join", (userId) => {
        socket.join(userId);
      });

      socket.on("sendMessage", async (data) => {
        const { senderId, receiverId, text, isAdmin } = data;
        try {
          if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.DATABASE!);
          }
          await ChatMessage.create({
            senderId,
            receiverId,
            message: text,
            isAdmin: !!isAdmin,
            timestamp: new Date()
          });
        } catch (err) {
          console.error("Error saving message:", err);
        }
        io.to(receiverId).emit("receiveMessage", data);
      });
    });
  }
  res.end();
}
