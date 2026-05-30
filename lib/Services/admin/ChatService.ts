import ChatMessage from "../../DB/Models/ChatMessageModel";
import User from "../../DB/Models/Usermodel";
import { connectDB } from "../../DB/dbconfig";

export class ChatService {
  static async getConversations() {
    await connectDB();
    
    // Get unique user IDs from ChatMessage
    // We want all IDs that are NOT 'admin'
    const senders = await ChatMessage.distinct("senderId", { senderId: { $ne: "admin" } });
    const receivers = await ChatMessage.distinct("receiverId", { receiverId: { $ne: "admin" } });
    
    // Combine and unique
    const uniqueUserIds = Array.from(new Set([...senders, ...receivers]));

    const conversations = await Promise.all(
      uniqueUserIds.map(async (uid) => {
        // Only try to find user if UID is a valid MongoDB ObjectId
        let user = null;
        if (uid && uid.length === 24) {
          user = await User.findById(uid).select("name email");
        }
        
        const lastMsg = await ChatMessage.findOne({
          $or: [{ senderId: uid }, { receiverId: uid }]
        }).sort({ timestamp: -1 });

        return {
          id: uid,
          name: user?.name || (uid === "guest" ? "Guest User" : "Unknown User"),
          lastMessage: lastMsg?.message || "",
          time: lastMsg?.timestamp ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "",
          timestamp: lastMsg?.timestamp || 0,
          online: false,
          unread: 0
        };
      })
    );

    return conversations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  static async getMessages(userId: string) {
    await connectDB();
    return await ChatMessage.find({
      $or: [
        { senderId: userId, receiverId: "admin" },
        { senderId: "admin", receiverId: userId }
      ]
    }).sort({ timestamp: 1 });
  }
}
