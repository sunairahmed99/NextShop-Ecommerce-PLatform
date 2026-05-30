import UserModel from "../../DB/Models/Usermodel";
import { connectDB } from "../../DB/dbconfig";

export const UserAdminService = {
  async getAllUsers() {
    await connectDB();
    return await UserModel.find().select("-password").sort({ createdAt: -1 });
  },

  async deleteUser(id: string) {
    await connectDB();
    return await UserModel.findByIdAndDelete(id);
  },

  async updateUserRole(id: string, role: string) {
    await connectDB();
    return await UserModel.findByIdAndUpdate(id, { role }, { new: true });
  }
};
