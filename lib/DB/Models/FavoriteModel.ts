import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IFavorite extends Document {
  userId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate favorites
FavoriteSchema.index({ userId: 1, productId: 1 }, { unique: true });

const FavoriteModel =
  models.Favorite || model<IFavorite>("Favorite", FavoriteSchema);

export default FavoriteModel;
