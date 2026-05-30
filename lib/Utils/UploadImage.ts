import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.Cloudname,
  api_key: process.env.Cloudkey,
  api_secret: process.env.Cloudsecret,
});

export const UploadImage = async (file: any, folder: string) => {
  const buffer = Buffer.from(await file.arrayBuffer());

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder }, (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      })
      .end(buffer);
  });
};

export const DeleteImage = async (publicId: string) => {
  return await cloudinary.uploader.destroy(publicId);
};
