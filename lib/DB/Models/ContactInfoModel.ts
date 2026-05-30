import mongoose, { Schema, Document } from "mongoose";

export interface IContactInfo extends Document {
  phone1: string;
  phone2: string;
  email1: string;
  email2: string;
  address: string;
  city: string;
  workingDays: string;
  workingHours: string;
  weekendDays: string;
  weekendHours: string;
}

const ContactInfoSchema: Schema = new Schema({
  phone1: { type: String, default: "+92 300 1234567" },
  phone2: { type: String, default: "+92 311 7654321" },
  email1: { type: String, default: "support@premiumstore.com" },
  email2: { type: String, default: "info@premiumstore.com" },
  address: { type: String, default: "123 Luxury Avenue, Fashion District" },
  city: { type: String, default: "Karachi, Pakistan" },
  workingDays: { type: String, default: "Mon - Fri" },
  workingHours: { type: String, default: "9:00 AM - 9:00 PM" },
  weekendDays: { type: String, default: "Sat - Sun" },
  weekendHours: { type: String, default: "10:00 AM - 6:00 PM" },
});

export default mongoose.models.ContactInfo || mongoose.model<IContactInfo>("ContactInfo", ContactInfoSchema);
