import mongoose, { Schema, Document } from "mongoose";

export interface IAbout extends Document {
  title: string;
  description: string;
  image: {
    url: string;
    publicId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AboutSchema: Schema = new Schema(
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

export default mongoose.models.About || mongoose.model<IAbout>("About", AboutSchema);
