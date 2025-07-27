// src/video/video.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import '../../config/cloudinary.config';
import * as streamifier from 'streamifier';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  private async uploadFileToCloudinary(file: Express.Multer.File): Promise<any> {
    const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: resourceType,
          folder: resourceType === 'video' ? 'video_uploads' : 'image_uploads',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async create(
    dto: CreateVideoDto,
    videoFile: Express.Multer.File,
    thumbnailFile: Express.Multer.File,
  ) {
    try {
      // Upload both video and thumbnail in parallel
      const [uploadedVideo, uploadedThumbnail] = await Promise.all([
        this.uploadFileToCloudinary(videoFile),
        this.uploadFileToCloudinary(thumbnailFile),
      ]);
  
      // Normalize tags input
      const parsedTags =
        typeof dto.tags === 'string'
          ? (dto.tags as string).split(',').map((tag) => tag.trim())
          : dto.tags;
  
      // Parse isFeatured safely to boolean
      const isFeatured =
        typeof dto.isFeatured === 'string'
          ? dto.isFeatured.toLowerCase() === 'true'
          : !!dto.isFeatured;
  
      // Save video record to database
      const video = await this.prisma.video.create({
        data: {
          title: dto.title,
          description: dto.description,
          thumbnailUrl: uploadedThumbnail.secure_url,
          videoUrl: uploadedVideo.secure_url,
          tags: parsedTags,
          isFeatured: isFeatured,
        },
      });
  
      return video;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new Error(
        'Upload failed: ' + (error?.message || 'Unknown Cloudinary error'),
      );
    }
  }
  


  async findAllVideos(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        skip,
        take: limit,
      }),
      this.prisma.video.count(),
    ]);

    return {
      data: videos,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findFeaturedVideos() {
    return this.prisma.video.findMany({
      where: { isFeatured: true },
      // orderBy: { publishedAt: 'desc' },
    });
  }

  async findRecentVideos(limit = 5) {
    return this.prisma.video.findMany({
      take: limit,
      // orderBy: { publishedAt: 'desc' },
    });
  }

  async incrementViews(videoId: string) {
    return this.prisma.video.update({
      where: { id: videoId },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    });
  }
}
