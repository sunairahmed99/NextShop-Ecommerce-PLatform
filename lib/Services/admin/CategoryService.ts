import { connectDB } from "@/lib/DB/dbconfig";
import Category from "@/lib/DB/Models/Categorymodel";
import { UploadImage, DeleteImage } from "@/lib/Utils/UploadImage";

export const CategoryService = {
  // Get all categories
  async getAllCategories() {
    await connectDB();
    return await Category.find().sort({ createdAt: -1 });
  },

  // Get single category
  async getCategoryById(id: string) {
    await connectDB();
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");
    return category;
  },

  // Create category
  async createCategory(formData: FormData) {
    try {
      await connectDB();
      const name = formData.get("name") as string;
      const image = formData.get("image") as File;

      if (!name || !image || (image instanceof File && image.size === 0)) {
        throw new Error("Missing name or image");
      }

      const uploadResult: any = await UploadImage(image, "categories");

      const newCategory = new Category({
        name,
        image: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        },
      });

      return await newCategory.save();
    } catch (error: any) {
      console.error("CategoryService.createCategory Error:", error);
      throw error;
    }
  },

  // Update category
  async updateCategory(id: string, formData: FormData) {
    try {
      await connectDB();
      const name = formData.get("name") as string;
      const image = formData.get("image") as any;

      const category = await Category.findById(id);
      if (!category) throw new Error("Category not found");

      if (name) category.name = name;

      if (image && image instanceof File && image.size > 0) {
        // Delete old image
        await DeleteImage(category.image.publicId);
        // Upload new image
        const uploadResult: any = await UploadImage(image, "categories");
        category.image = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        };
      }

      return await category.save();
    } catch (error: any) {
      console.error("CategoryService.updateCategory Error:", error);
      throw error;
    }
  },

  // Delete category
  async deleteCategory(id: string) {
    await connectDB();
    const category = await Category.findById(id);
    if (!category) throw new Error("Category not found");

    if (category.image && category.image.publicId) {
      await DeleteImage(category.image.publicId);
    }
    return await Category.findByIdAndDelete(id);
  },
};
