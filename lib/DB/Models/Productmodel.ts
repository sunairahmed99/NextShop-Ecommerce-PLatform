import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;

  price: number;
  discount: number;
  discountPrice: number;

  categoryId: mongoose.Types.ObjectId;

  brand?: string;
  sku?: string;

  images: {
    url: string;
    public_id: string;
  }[];

  thumbnail?: {
    url: string;
    public_id: string;
  };

  colors: string[];

  sizes: {
    size: string;
    qty: number;
  }[];

  totalQty: number;

  // DISPLAY TYPE
  ptype: "featured" | "best" | "recent";

  isPublished: boolean;

  sold: number;
  views: number;

  seoTitle?: string;
  seoDescription?: string;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    // BASIC INFO
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    description: {
      type: String,
      required: true,
    },

    // PRICE
    price: {
      type: Number,
      required: true,
    },

    discount: {
      type: Number,
      default: 0,
    },

    discountPrice: {
      type: Number,
      default: 0,
    },

    // CATEGORY
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // EXTRA
    brand: {
      type: String,
    },

    sku: {
      type: String,
      unique: true,
      sparse: true,
    },

    // IMAGES
    images: [
      {
        url: {
          type: String,
          required: true,
        },

        public_id: {
          type: String,
          required: true,
        },
      },
    ],

    thumbnail: {
      url: String,
      public_id: String,
    },

    // COLORS
    colors: [
      {
        type: String,
      },
    ],

    // SIZES
    sizes: [
      {
        size: {
          type: String,
          required: true,
        },

        qty: {
          type: Number,
          required: true,
          default: 0,
        },
      },
    ],

    // TOTAL STOCK
    totalQty: {
      type: Number,
      default: 0,
    },

    // PRODUCT DISPLAY TYPE
    ptype: {
      type: String,
      enum: ["featured", "best", "recent"],
      default: "recent",
    },

    // STATUS
    isPublished: {
      type: Boolean,
      default: true,
    },

    // ANALYTICS
    sold: {
      type: Number,
      default: 0,
    },

    views: {
      type: Number,
      default: 0,
    },

    // SEO
    seoTitle: String,
    seoDescription: String,
  },
  {
    timestamps: true,
  }
);

// AUTO DISCOUNT PRICE AND TOTAL QUANTITY
ProductSchema.pre("save", async function (this: IProduct) {
  // Calculate discount price
  if (this.discount > 0) {
    this.discountPrice = this.price - (this.price * this.discount) / 100;
  } else {
    this.discountPrice = this.price;
  }

  // Calculate total quantity from sizes
  if (this.sizes && this.sizes.length > 0) {
    this.totalQty = this.sizes.reduce((acc, curr) => acc + curr.qty, 0);
  }
});

const ProductModel: Model<IProduct> =
  mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);

export default ProductModel;
