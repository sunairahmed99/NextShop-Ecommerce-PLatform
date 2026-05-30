import { connectDB } from "@/lib/DB/dbconfig";
import OrderModel from "@/lib/DB/Models/Ordermodel";
import Usermodel from "@/lib/DB/Models/Usermodel";
import ProductModel from "@/lib/DB/Models/Productmodel";

export class DashboardService {
  /**
   * Fetch aggregate statistics for the admin dashboard.
   */
  static async getDashboardStats() {
    try {
      await connectDB();

      // Aggregate Total Sales (excluding cancelled orders)
      const salesAggregation = await OrderModel.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalSales: { $sum: "$total" } } }
      ]);
      const totalSales = salesAggregation.length > 0 ? salesAggregation[0].totalSales : 0;

      // Count metrics
      const totalOrders = await OrderModel.countDocuments();
      const totalUsers = await Usermodel.countDocuments();
      const totalProducts = await ProductModel.countDocuments();

      // Aggregate Current Month Sales
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const currentMonthAggregation = await OrderModel.aggregate([
        { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, currentMonthSales: { $sum: "$total" } } }
      ]);
      const currentMonthSales = currentMonthAggregation.length > 0 ? currentMonthAggregation[0].currentMonthSales : 0;

      return {
        totalSales,
        totalOrders,
        totalUsers,
        totalProducts,
        currentMonthSales
      };
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        totalProducts: 0,
        currentMonthSales: 0
      };
    }
  }

  /**
   * Fetch the most recent orders for the transactions table.
   * @param limit Number of transactions to return
   */
  static async getRecentTransactions(limit: number = 5) {
    try {
      await connectDB();

      const transactions = await OrderModel.find()
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return transactions.map(t => ({
        _id: t._id.toString(),
        date: t.createdAt,
        fullName: t.fullName,
        paymentMethod: t.paymentMethod,
        status: t.status,
        amount: t.total
      }));
    } catch (error: any) {
      console.error("Error fetching recent transactions:", error);
      return [];
    }
  }
}
