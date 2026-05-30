import UserModel, { IUser } from "../../DB/Models/Usermodel";
import { connectDB } from "../../DB/dbconfig";
import { signToken, verifyToken } from "../../jwt";
import { sendEmail } from "../../Utils/nodemailer";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { UploadImage } from "../../Utils/UploadImage";

export const register = async (userData: any, imageFile?: any) => {
  try {
    await connectDB();
    const { name, email, password, phone } = userData;

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      if (existingUser.isVerified) {
        return NextResponse.json(
          { success: false, message: "User already exists" },
          { status: 400 }
        );
      } else {
        await UserModel.deleteOne({ _id: existingUser._id });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpire = new Date(Date.now() + 3600000); // 1 hour

    let imageurl = "";
    let imagekey = "";

    if (imageFile) {
      const uploadRes: any = await UploadImage(imageFile, "users");
      imageurl = uploadRes.secure_url;
      imagekey = uploadRes.public_id;
    }

    const newUser = await UserModel.create({
      name,
      email,
      password: hashedPassword,
      phone,
      verifyCode,
      verifyCodeExpire,
      isVerified: false,
      imageurl,
      imagekey,
    });

    await sendEmail(
      email,
      "Verify your account",
      `<h1>Welcome ${name}</h1><p>Your verification code is: <b>${verifyCode}</b></p>`
    );

    return NextResponse.json(
      { success: true, message: "User registered successfully. Please verify your email.", data: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
};

export const login = async (credentials: any) => {
  try {
    await connectDB();
    const email = credentials.email?.toLowerCase().trim();
    const password = credentials.password;


    const user = await UserModel.findOne({ email });
    if (!user) {

      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.isGoogle) {
      return NextResponse.json(
        { success: false, message: "This account is registered via Google. Please sign in using Google." },
        { status: 400 }
      );
    }

    if (!user.isVerified) {

      return NextResponse.json(
        { success: false, message: "Please verify your email first" },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);


    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    const token = signToken({ id: user._id, role: user.role });
    const response = NextResponse.json(
      {
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
      { status: 200 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
};

export const userverify = async (code: string) => {
  try {
    await connectDB();
    const user = await UserModel.findOne({ verifyCode: code });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.verifyCode !== code || (user.verifyCodeExpire && user.verifyCodeExpire < new Date())) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification code" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verifyCode = "";
    user.verifyCodeExpire = undefined;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Account verified successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
};


export const forgotpassword = async (email: string) => {
  try {
    await connectDB();
    const user = await UserModel.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    if (user.isGoogle) {
      return NextResponse.json(
        { success: false, message: "This account is registered via Google. Password recovery is not supported." },
        { status: 400 }
      );
    }

    const forgotCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.forgotCode = forgotCode;
    user.forgotCodeExpire = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    await sendEmail(
      email,
      "Password Reset Code",
      `<p>Your password reset code is: <b>${forgotCode}</b></p>`
    );

    return NextResponse.json(
      { success: true, message: "Reset code sent to your email", data: forgotCode },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
};

export const resetpassword = async (code: string, newPassword: string) => {
  try {
    await connectDB();
    const user = await UserModel.findOne({ forgotCode: code });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset code" },
        { status: 404 }
      );
    }

    if (user.forgotCodeExpire && user.forgotCodeExpire < new Date()) {
      return NextResponse.json(
        { success: false, message: "Reset code has expired" },
        { status: 400 }
      );
    }

    if (!newPassword) {
      return NextResponse.json(
        { success: false, message: "New password is required" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.forgotCode = "";
    user.forgotCodeExpire = undefined;
    await user.save();

    return NextResponse.json(
      { success: true, message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
};
