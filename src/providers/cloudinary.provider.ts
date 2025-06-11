// src/providers/cloudinary.provider.ts
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Options } from 'multer-storage-cloudinary';

export const CloudinaryStorageVideo = new CloudinaryStorage({
  cloudinary,
  params: {
    resource_type: 'video',
    folder: 'video_uploads',
    format: async (req, file) => 'mp4',
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  } as unknown as Options['params'], // 👈 bypassing strict typing
});
