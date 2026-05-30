import { Server } from "socket.io";
import ChatMessage from "../DB/Models/ChatMessageModel";
import { connectDB } from "../DB/dbconfig";

export const socketHandler = (io: Server) => {
  io.on("connection", (socket) => {


    socket.on("join", (userId) => {
      socket.join(userId);

    });

    socket.on("sendMessage", async (data) => {
      const { senderId, receiverId, message, isAdmin } = data;

      try {
        await connectDB();
        const chatEntry = await ChatMessage.create({
          senderId,
          receiverId,
          message,
          isAdmin,
        });

        // Emit to the receiver's room
        io.to(receiverId).emit("receiveMessage", chatEntry);
        // Also emit back to sender to confirm receipt
        socket.emit("messageSent", chatEntry);
      } catch (error) {
        // console.error("Socket error:", error);
      }
    });

    socket.on("disconnect", () => {

    });
  });
};
