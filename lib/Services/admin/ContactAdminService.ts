import ContactModel from "../../DB/Models/Contactmodel";
import { connectDB } from "../../DB/dbconfig";

export const ContactAdminService = {
  async getAllContacts() {
    await connectDB();
    return await ContactModel.find().sort({ createdAt: -1 });
  },

  async deleteContact(id: string) {
    await connectDB();
    return await ContactModel.findByIdAndDelete(id);
  }
};
