// src/config/cloudinary.config.ts
import { v2 as cloudinary } from 'cloudinary';

import * as dotenv from 'dotenv';

import { Readable } from 'stream';

dotenv.config(); // Ensure .env is loaded
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export { cloudinary };

export function uploadToCloudinary(buffer: Buffer, folder: string, resourceType: 'image' | 'video'): Promise<string> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result?.secure_url as string);
      },
    );

    Readable.from(buffer).pipe(stream);
  });
}