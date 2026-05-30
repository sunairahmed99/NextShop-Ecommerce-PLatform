import UserModel from "../DB/Models/Usermodel";
import { connectDB } from "../DB/dbconfig";
import { NextRequest, NextResponse } from "next/server";
import { UploadImage, DeleteImage } from "../Utils/UploadImage";
import { verifyToken } from "../jwt";

export const getProfileRaw = async (userId: string) => {
  try {
    await connectDB();
    const user = await UserModel.findById(userId).select("-password");
    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    return null;
  }
};

export const getProfile = async (userId: string) => {
  try {
    await connectDB();
    const user = await UserModel.findById(userId).select("-password");
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: user }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
};

export const updateProfile = async (userId: string, formData: FormData) => {
  try {
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const imageFile = formData.get("image");

    await connectDB();
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update basic info (Email update is NOT allowed)
    if (name) user.name = name;
    if (phone) user.phone = phone;

    // Handle Image Update
    if (imageFile && (imageFile as any).size > 0) {
      // Delete old image if exists
      if (user.imagekey) {
        await DeleteImage(user.imagekey);
      }

      // Upload new image
      const uploadRes: any = await UploadImage(imageFile, "users");
      user.imageurl = uploadRes.secure_url;
      user.imagekey = uploadRes.public_id;
    }

    await user.save();

    return NextResponse.json(
      { success: true, message: "Profile updated successfully", data: user },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
};
