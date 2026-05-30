import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  thumbnail: string;
  price: number;
  discountPrice: number;
  qty: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface IOrder extends Document {
  userId: mongoose.Types.ObjectId;
  items: IOrderItem[];
  
  // Customer Info
  fullName: string;
  email: string;
  phone: string;
  
  // Shipping Address
  address: string;
  city: string;
  zipCode: string;
  
  // Pricing
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
  total: number;
  
  // Order Status
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentMethod: string;
  paymentId?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true },
  thumbnail: { type: String, default: "" },
  price: { type: Number, required: true },
  discountPrice: { type: Number, required: true },
  qty: { type: Number, required: true, min: 1 },
  selectedColor: { type: String, default: "" },
  selectedSize: { type: String, default: "" },
}, { _id: false });

const OrderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: {
      type: [OrderItemSchema],
      required: true,
      validate: [(val: any[]) => val.length > 0, "Order must have at least one item"],
    },

    // Customer Info
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },

    // Shipping Address
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },

    // Pricing
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    couponCode: { type: String, default: "" },
    total: { type: Number, required: true },

    // Status
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      default: "COD",
    },
    paymentId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const OrderModel: Model<IOrder> =
  mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);

export default OrderModel;
