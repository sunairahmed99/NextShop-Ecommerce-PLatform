import { connectDB } from "@/lib/DB/dbconfig";
import Product from "@/lib/DB/Models/Productmodel";
import { UploadImage, DeleteImage } from "@/lib/Utils/UploadImage";

export const ProductService = {
  // Get all products
  async getAllProducts() {
    await connectDB();
    return await Product.find().populate("categoryId", "name").sort({ createdAt: -1 });
  },

  // Get single product
  async getProductById(id: string) {
    await connectDB();
    const product = await Product.findById(id).populate("categoryId", "name");
    if (!product) throw new Error("Product not found");
    return product;
  },

  // Get product by slug (Client side SSR)
  async getProductBySlug(slug: string) {
    await connectDB();
    const product = await Product.findOne({ slug }).populate("categoryId", "name");
    if (!product) throw new Error("Product not found");
    return product;
  },

  // Get related products by category
  async getRelatedProducts(categoryId: string, excludeId: string) {
    await connectDB();
    return await Product.find({ 
      categoryId, 
      _id: { $ne: excludeId },
      isPublished: true 
    })
    .limit(4)
    .populate("categoryId", "name");
  },

  // Create product
  async createProduct(formData: FormData) {
    try {
      await connectDB();
      
      const name = formData.get("name") as string;
      const description = formData.get("description") as string;
      const price = parseFloat(formData.get("price") as string);
      const discount = parseFloat(formData.get("discount") as string) || 0;
      const categoryId = formData.get("categoryId") as string;
      const brand = formData.get("brand") as string;
      const sku = formData.get("sku") as string;
      const ptype = formData.get("ptype") as any || "recent";
      const isPublished = formData.get("isPublished") === "true";
      
      // Parse arrays
      const colors = JSON.parse(formData.get("colors") as string || "[]");
      const sizes = JSON.parse(formData.get("sizes") as string || "[]");
      
      // Calculate total qty
      const totalQty = sizes.reduce((acc: number, item: any) => acc + (parseInt(item.qty) || 0), 0);

      // Slug generation
      const slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");

      // Handle Images
      const imageFiles = formData.getAll("images") as File[];
      const uploadedImages = [];

      for (const file of imageFiles) {
        if (file.size > 0) {
          const res: any = await UploadImage(file, "products");
          uploadedImages.push({
            url: res.secure_url,
            public_id: res.public_id,
          });
        }
      }

      // Thumbnail (optional, use first image if not provided)
      let thumbnail = null;
      if (uploadedImages.length > 0) {
        thumbnail = uploadedImages[0];
      }

      const newProduct = new Product({
        name,
        slug,
        description,
        price,
        discount,
        categoryId,
        brand,
        sku,
        ptype,
        isPublished,
        colors,
        sizes,
        totalQty,
        images: uploadedImages,
        thumbnail,
      });

      return await newProduct.save();
    } catch (error: any) {
      console.error("ProductService.createProduct Error:", error);
      throw error;
    }
  },

  // Update product
  async updateProduct(id: string, formData: FormData) {
    try {
      await connectDB();
      const product = await Product.findById(id);
      if (!product) throw new Error("Product not found");

      const name = formData.get("name") as string;
      if (name) {
        product.name = name;
        product.slug = name.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
      }

      if (formData.get("description")) product.description = formData.get("description") as string;
      if (formData.get("price")) product.price = parseFloat(formData.get("price") as string);
      if (formData.get("discount")) product.discount = parseFloat(formData.get("discount") as string);
      if (formData.get("categoryId")) product.categoryId = formData.get("categoryId") as any;
      if (formData.get("brand")) product.brand = formData.get("brand") as string;
      if (formData.get("sku")) product.sku = formData.get("sku") as string;
      if (formData.get("ptype")) product.ptype = formData.get("ptype") as any;
      if (formData.get("isPublished")) product.isPublished = formData.get("isPublished") === "true";

      if (formData.get("colors")) product.colors = JSON.parse(formData.get("colors") as string);
      if (formData.get("sizes")) {
        const sizes = JSON.parse(formData.get("sizes") as string);
        product.sizes = sizes;
        product.totalQty = sizes.reduce((acc: number, item: any) => acc + (parseInt(item.qty) || 0), 0);
      }

      // Handle New Images (Append or Replace)
      const newImageFiles = formData.getAll("images") as File[];
      if (newImageFiles.length > 0 && newImageFiles[0].size > 0) {
        // Option: Replace all images for simplicity in this version
        // Delete old images first
        for (const img of product.images) {
          await DeleteImage(img.public_id);
        }

        const uploadedImages = [];
        for (const file of newImageFiles) {
          if (file.size > 0) {
            const res: any = await UploadImage(file, "products");
            uploadedImages.push({
              url: res.secure_url,
              public_id: res.public_id,
            });
          }
        }
        product.images = uploadedImages;
        product.thumbnail = uploadedImages[0];
      }

      return await product.save();
    } catch (error: any) {
      console.error("ProductService.updateProduct Error:", error);
      throw error;
    }
  },

  // Delete product
  async deleteProduct(id: string) {
    await connectDB();
    const product = await Product.findById(id);
    if (!product) throw new Error("Product not found");

    // Delete images from Cloudinary
    for (const img of product.images) {
      await DeleteImage(img.public_id);
    }

    return await Product.findByIdAndDelete(id);
  },
};
