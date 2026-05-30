import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/DB/dbconfig";
import UserModel from "@/lib/DB/Models/Usermodel";
import { signToken } from "@/lib/jwt";
import bcrypt from "bcryptjs";
import axios from "axios";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const origin = req.nextUrl.origin;
  const redirect_uri = `${origin}/api/auth/google/callback`;

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=no_code`);
  }

  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;

  if (!client_id || !client_secret || client_id.includes("YOUR_GOOGLE_CLIENT_ID") || client_secret.includes("YOUR_GOOGLE_CLIENT_SECRET")) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_keys`);
  }

  try {
    // 1. Exchange authorization code for access token
    const tokenResponse = await axios.post("https://oauth2.googleapis.com/token", {
      client_id,
      client_secret,
      code,
      grant_type: "authorization_code",
      redirect_uri,
    });

    const { access_token } = tokenResponse.data;

    if (!access_token) {
      throw new Error("Failed to obtain access token from Google");
    }

    // 2. Fetch user information from Google
    const userinfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const googleUser = userinfoResponse.data;
    const { email, name, picture } = googleUser;

    if (!email) {
      throw new Error("Failed to obtain email from Google account");
    }

    await connectDB();

    // 3. Find or create user in DB
    let user = await UserModel.findOne({ email: email.toLowerCase().trim() });

    if (user) {
      // Update imageurl if not set, verify status, and set isGoogle to true
      let updated = false;
      if (!user.imageurl && picture) {
        user.imageurl = picture;
        updated = true;
      }
      if (!user.isVerified) {
        user.isVerified = true;
        updated = true;
      }
      if (!user.isGoogle) {
        user.isGoogle = true;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      // Generate a strong random password since user model requires password
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);

      user = await UserModel.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        isVerified: true,
        isGoogle: true,
        imageurl: picture || "",
        role: "user",
      });
    }

    // 4. Generate JWT Token using signature from jwt helper
    const token = signToken({ id: user._id, role: user.role });

    // 5. Create redirect response and set cookie
    const response = NextResponse.redirect(`${origin}/`);
    
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Google OAuth Error:", error.response?.data || error.message || error);
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }
}
