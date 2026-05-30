import mongoose, { Schema, Document, models, model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  password: string;

  role: "admin" | "user";

  imageurl?: string;
  imagekey?: string;

  isVerified: boolean;

  verifyCode?: string;
  verifyCodeExpire?: Date;

  forgotCode?: string;
  forgotCodeExpire?: Date;

  resetPasswordcode?: string;
  resetPasswordExpire?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    imageurl: {
      type: String,
      default: "",
    },

    imagekey: {
      type: String,
      default: "",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verifyCode: {
      type: String,
      default: "",
    },

    verifyCodeExpire: {
      type: Date,
    },

  
    forgotCode: {
      type: String,
      default: "",
    },

    forgotCodeExpire: {
      type: Date,
    },

    resetPasswordcode: {
      type: String,
      default: "",
    },

    resetPasswordExpire: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const UserModel =
  models.User || model<IUser>("User", UserSchema);

export default UserModel;