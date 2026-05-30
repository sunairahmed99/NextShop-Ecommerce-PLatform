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

    // Drop old single unique email index if it exists, to allow compound uniqueness
    try {
      await mongoose.connection.db?.collection("users").dropIndex("email_1");
    } catch (error) {
      // Index might not exist or already dropped, ignore
    }

  } catch (error) {
    // console.log("❌ MongoDB Error:", error);
    throw error;
  }
}