import { connectDB } from "@/lib/DB/dbconfig";
import OrderModel from "@/lib/DB/Models/Ordermodel";

export const OrderService = {
  // Create a new order
  async createOrder(data: any) {
    await connectDB();

    const order = new OrderModel({
      userId: data.userId,
      items: data.items.map((item: any) => ({
        productId: item._id,
        name: item.name,
        thumbnail: item.thumbnail,
        price: item.price,
        discountPrice: item.discountPrice,
        qty: item.qty,
        selectedColor: item.selectedColor || "",
        selectedSize: item.selectedSize || "",
      })),
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      address: data.address,
      city: data.city,
      zipCode: data.zipCode,
      subtotal: data.subtotal,
      shipping: data.shipping,
      discount: data.discount || 0,
      couponCode: data.couponCode || "",
      total: data.total,
      paymentMethod: data.paymentMethod || "COD",
      status: "pending",
    });

    const savedOrder = await order.save();
    return await OrderModel.findById(savedOrder._id)
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug thumbnail");
  },

  // Get all orders (admin)
  async getAllOrders() {
    await connectDB();
    return await OrderModel.find()
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug thumbnail")
      .sort({ createdAt: -1 });
  },

  // Get orders by user
  async getOrdersByUser(userId: string) {
    await connectDB();
    return await OrderModel.find({ userId })
      .populate("items.productId", "name slug thumbnail")
      .sort({ createdAt: -1 });
  },

  // Get single order
  async getOrderById(id: string) {
    await connectDB();
    const order = await OrderModel.findById(id)
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug thumbnail");
    if (!order) throw new Error("Order not found");
    return order;
  },

  // Update order status
  async updateOrderStatus(id: string, status: string) {
    await connectDB();
    const order = await OrderModel.findById(id);
    if (!order) throw new Error("Order not found");
    order.status = status as any;
    return await order.save();
  },

  // Delete order
  async deleteOrder(id: string) {
    await connectDB();
    return await OrderModel.findByIdAndDelete(id);
  },
};
