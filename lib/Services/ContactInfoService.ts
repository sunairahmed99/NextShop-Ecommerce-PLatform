import ContactInfoModel from "../DB/Models/ContactInfoModel";
import { connectDB } from "../DB/dbconfig";

export const ContactInfoService = {
  async getContactInfo() {
    await connectDB();
    let info = await ContactInfoModel.findOne();
    if (!info) {
      info = await ContactInfoModel.create({});
    }
    return info;
  },

  async updateContactInfo(data: any) {
    await connectDB();
    let info = await ContactInfoModel.findOne();
    if (!info) {
      return await ContactInfoModel.create(data);
    }
    return await ContactInfoModel.findByIdAndUpdate(info._id, data, { new: true });
  }
};
