import { connectDB } from "@/lib/DB/dbconfig";
import Banner from "@/lib/DB/Models/Bannermodel";
import { UploadImage, DeleteImage } from "@/lib/Utils/UploadImage";

export const BannerService = {
  // Get all banners
  async getAllBanners() {
    await connectDB();
    return await Banner.find().sort({ createdAt: -1 });
  },

  // Get single banner
  async getBannerById(id: string) {
    await connectDB();
    const banner = await Banner.findById(id);
    if (!banner) throw new Error("Banner not found");
    return banner;
  },

  // Create banner
  async createBanner(formData: FormData) {
    try {
      await connectDB();
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const image = formData.get("image") as File;



      if (!title || !description || !image || (image instanceof File && image.size === 0)) {
        throw new Error("Missing or empty fields: title, description, or image");
      }


      const uploadResult: any = await UploadImage(image, "banners");


      const newBanner = new Banner({
        title,
        description,
        image: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        },
      });

      const savedBanner = await newBanner.save();

      return savedBanner;
    } catch (error: any) {
      // console.error("BannerService.createBanner Error:", error);
      throw error;
    }
  },

  // Update banner
  async updateBanner(id: string, formData: FormData) {
    try {
      await connectDB();
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const image = formData.get("image") as any;



      const banner = await Banner.findById(id);
      if (!banner) throw new Error("Banner not found");

      if (title) banner.title = title;
      if (description) banner.description = description;

      if (image && image instanceof File && image.size > 0) {

        // Delete old image
        await DeleteImage(banner.image.publicId);
        // Upload new image
        const uploadResult: any = await UploadImage(image, "banners");
        banner.image = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
        };

      }

      const updatedBanner = await banner.save();

      return updatedBanner;
    } catch (error: any) {
      // console.error("BannerService.updateBanner Error:", error);
      throw error;
    }
  },

  // Delete banner
  async deleteBanner(id: string) {
    await connectDB();
    const banner = await Banner.findById(id);
    if (!banner) throw new Error("Banner not found");

    await DeleteImage(banner.image.publicId);
    return await Banner.findByIdAndDelete(id);
  },
};
