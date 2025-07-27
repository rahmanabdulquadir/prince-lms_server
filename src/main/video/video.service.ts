// src/video/video.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import '../../config/cloudinary.config';
import * as streamifier from 'streamifier';

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  private async uploadFileToCloudinary(
    file: Express.Multer.File,
  ): Promise<any> {
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
      const [uploadedVideo, uploadedThumbnail] = await Promise.all([
        this.uploadFileToCloudinary(videoFile),
        this.uploadFileToCloudinary(thumbnailFile),
      ]);

      const parsedTags =
        typeof dto.tags === 'string'
          ? (dto.tags as string).split(',').map((tag) => tag.trim())
          : dto.tags;

      const isFeatured =
        typeof dto.isFeatured === 'string'
          ? dto.isFeatured.toLowerCase() === 'true'
          : !!dto.isFeatured;

      const duration = uploadedVideo?.duration || null; // 👈 Extract duration in seconds

      const video = await this.prisma.video.create({
        data: {
          title: dto.title,
          description: dto.description,
          thumbnailUrl: uploadedThumbnail.secure_url,
          videoUrl: uploadedVideo.secure_url,
          tags: parsedTags,
          isFeatured: isFeatured,
          duration: duration, // 👈 Store in DB
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

  async getAllVideos(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [videos, total] = await this.prisma.$transaction([
      this.prisma.video.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { likes: true },
          },
        },
      }),
      this.prisma.video.count(),
    ]);

    const formattedVideos = videos.map((video) => ({
      ...video,
      likeCount: video._count.likes,
    }));

    return {
      data: formattedVideos,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findFeaturedVideos() {
    const videos = await this.prisma.video.findMany({
      where: { isFeatured: true },
      include: {
        _count: {
          select: { likes: true },
        },
      },
    });

    return videos.map((video) => ({
      ...video,
      likeCount: video._count.likes,
    }));
  }

  async findRecentVideos(limit = 5) {
    const videos = await this.prisma.video.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { likes: true },
        },
      },
    });

    return videos.map((video) => ({
      ...video,
      likeCount: video._count.likes,
    }));
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

  async delete(videoId: string) {
    try {
      // Get the video from the database
      const video = await this.prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new Error('Video not found');
      }

      // Extract public_id from the Cloudinary URL (assuming you saved full URL)
      const extractPublicId = (url: string) => {
        const parts = url.split('/');
        const publicIdWithExtension = parts[parts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        return (
          parts.slice(parts.length - 2, parts.length - 1)[0] + '/' + publicId
        ); // e.g., folder/filename
      };

      const videoPublicId = extractPublicId(video.videoUrl);
      const thumbnailPublicId = extractPublicId(video.thumbnailUrl);

      // Delete from Cloudinary
      await Promise.all([
        cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' }),
        cloudinary.uploader.destroy(thumbnailPublicId, {
          resource_type: 'image',
        }),
      ]);

      // Delete from DB
      await this.prisma.video.delete({
        where: { id: videoId },
      });

      return { message: 'Video deleted successfully' };
    } catch (error) {
      console.error('Video deletion failed:', error);
      throw new Error(
        'Video deletion failed: ' + (error?.message || 'Unknown error'),
      );
    }
  }

  async likeVideo(videoId: string, userId: string) {
    // Check if the user already liked the video
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (existingLike) {
      throw new BadRequestException('You already liked this video');
    }

    // Create the like
    await this.prisma.like.create({
      data: {
        userId,
        videoId,
      },
    });

    // Optionally return updated count
    const likeCount = await this.prisma.like.count({
      where: { videoId },
    });

    return {
      message: 'Video liked successfully',
      likeCount,
    };
  }

  async unlikeVideo(videoId: string, userId: string) {
    // Check if like exists
    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (!existingLike) {
      throw new NotFoundException('Like does not exist');
    }

    // Delete the like
    await this.prisma.like.delete({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    const likeCount = await this.prisma.like.count({
      where: { videoId },
    });

    return {
      message: 'Video unliked successfully',
      likeCount,
    };
  }
  async getLikeCount(videoId: string) {
    const count = await this.prisma.like.count({
      where: { videoId },
    });

    return { videoId, likeCount: count };
  }
}
