import mongoose, { Schema, Document } from "mongoose";

export interface IChatMessage extends Document {
  senderId: string;
  receiverId: string;
  message: string;
  isAdmin: boolean;
  timestamp: Date;
}

const ChatMessageSchema: Schema = new Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.ChatMessage || mongoose.model<IChatMessage>("ChatMessage", ChatMessageSchema);
