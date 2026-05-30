import mongoose, { Schema, Document } from "mongoose";

export interface IWebsiteSettings extends Document {
  logo: {
    url: string;
    publicId: string;
  };
  siteName: string;
  footerDescription: string;
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
  };
  whatsappNumber: string;
  footerLinks: {
    column1Title: string;
    column2Title: string;
  };
  shippingFee: number;
  freeShippingThreshold: number;
}

const WebsiteSettingsSchema: Schema = new Schema({
  logo: {
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  siteName: { type: String, default: "NEXTSHOP" },
  footerDescription: { type: String, default: "Your premium destination for luxury fashion and lifestyle products. We provide the best quality and service." },
  socialLinks: {
    facebook: { type: String, default: "https://facebook.com" },
    twitter: { type: String, default: "https://twitter.com" },
    instagram: { type: String, default: "https://instagram.com" },
    linkedin: { type: String, default: "https://linkedin.com" },
  },
  whatsappNumber: { type: String, default: "" },
  footerLinks: {
    column1Title: { type: String, default: "Quick Links" },
    column2Title: { type: String, default: "Information" },
  },
  shippingFee: { type: Number, default: 150 },
  freeShippingThreshold: { type: Number, default: 20000 },
});

export default mongoose.models.WebsiteSettings || mongoose.model<IWebsiteSettings>("WebsiteSettings", WebsiteSettingsSchema);
