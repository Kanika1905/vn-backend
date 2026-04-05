import dotenv from "dotenv";
dotenv.config(); // ← add this as first line

import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Reads from your .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Store uploaded images directly in Cloudinary (not on disk)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          "wholesaler/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 800, height: 800, crop: "limit", quality: "auto" }
    ],
  },
});

// Accept up to 3 images, max 5MB each
export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default cloudinary;