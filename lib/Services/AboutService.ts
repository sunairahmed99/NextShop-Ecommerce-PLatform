import AboutModel from "../DB/Models/AboutModel";
import { connectDB } from "../DB/dbconfig";
import { UploadImage, DeleteImage } from "../Utils/UploadImage";

export const AboutService = {
  async getAbout() {
    await connectDB();
    let about = await AboutModel.findOne();
    if (!about) {
      // Create a default one if it doesn't exist
      about = await AboutModel.create({
        title: "About Us",
        description: "Welcome to our store. We provide the best products for you.",
        image: {
          url: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=1200&auto=format&fit=crop",
          publicId: "placeholder_about",
        },
      });
    }
    return about;
  },

  async updateAbout(formData: FormData) {
    await connectDB();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const image = formData.get("image") as any;

    let about = await AboutModel.findOne();
    if (!about) {
      // If for some reason it doesn't exist, create it with default image first or require one
      throw new Error("About record not found. Please initialize first.");
    }

    if (title) about.title = title;
    if (description) about.description = description;

    if (image && image instanceof File && image.size > 0) {
      // Delete old image if it's not the placeholder
      if (about.image.publicId && about.image.publicId !== "placeholder") {
        await DeleteImage(about.image.publicId);
      }
      // Upload new image
      const uploadResult: any = await UploadImage(image, "about");
      about.image = {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
      };
    }

    return await about.save();
  }
};
