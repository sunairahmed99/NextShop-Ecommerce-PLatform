import WebsiteSettingsModel from "../DB/Models/WebsiteSettingsModel";
import { connectDB } from "../DB/dbconfig";
import { UploadImage, DeleteImage } from "../Utils/UploadImage";

export const WebsiteSettingsService = {
  async getSettings() {
    await connectDB();
    let settings = await WebsiteSettingsModel.findOne();
    if (!settings) {
      settings = await WebsiteSettingsModel.create({});
    }
    return settings;
  },

  async updateSettings(data: any, logoFile?: any) {
    await connectDB();
    let settings = await WebsiteSettingsModel.findOne();
    if (!settings) {
      settings = await WebsiteSettingsModel.create({});
    }

    // Handle Logo Upload
    if (logoFile && logoFile.size > 0) {
      if (settings.logo?.publicId) {
        await DeleteImage(settings.logo.publicId);
      }
      const uploadRes: any = await UploadImage(logoFile, "settings");
      data.logo = {
        url: uploadRes.secure_url,
        publicId: uploadRes.public_id,
      };
    }

    // Handle nested fields (Social Links and Footer Links)
    if (typeof data.socialLinks === 'string') data.socialLinks = JSON.parse(data.socialLinks);
    if (typeof data.footerLinks === 'string') data.footerLinks = JSON.parse(data.footerLinks);

    return await WebsiteSettingsModel.findByIdAndUpdate(settings._id, data, { new: true });
  }
};
