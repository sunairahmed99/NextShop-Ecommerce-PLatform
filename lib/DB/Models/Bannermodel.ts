import mongoose, { Schema, Document } from "mongoose";

export interface IBanner extends Document {
  title: string;
  description: string;
  image: {
    url: string;
    publicId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Banner || mongoose.model<IBanner>("Banner", BannerSchema);
