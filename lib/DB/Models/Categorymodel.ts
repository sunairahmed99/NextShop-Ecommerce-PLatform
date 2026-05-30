import mongoose, { Schema, Document, models, model } from "mongoose";

export interface ICategory extends Document {
  name: string;
  image: {
    url: string;
    publicId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      unique: true,
    },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
  },
  {
    timestamps: true,
  }
);

const Category = models.Category || model<ICategory>("Category", CategorySchema);

export default Category;
