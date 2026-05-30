import mongoose from "mongoose";

const MONGODB_URI = process.env.DATABASE!;

if (!MONGODB_URI) {
  throw new Error("Please add MONGODB_URI in .env");
}

export async function connectDB() {
  try {
    if (mongoose.connection.readyState >= 1) {
      return;
    }
    await mongoose.connect(MONGODB_URI);

  } catch (error) {
    // console.log("❌ MongoDB Error:", error);
    throw error;
  }
}