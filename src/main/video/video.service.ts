// src/video/video.service.ts
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { v2 as cloudinary } from 'cloudinary';
import '../../config/cloudinary.config';
import * as streamifier from 'streamifier';
import { UpdateVideoDto } from './dto/update-video.dto';
import { NotificationService } from '../notification/notification.service';


@Injectable()
export class VideoService {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService, // 👈 inject
  ) {}

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

  // ✅ Create video and broadcast notification
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
          ? (dto.isFeatured as string).toLowerCase() === 'true'
          : !!dto.isFeatured;

      const duration = uploadedVideo?.duration || null;

      const video = await this.prisma.video.create({
        data: {
          title: dto.title,
          description: dto.description,
          thumbnailUrl: uploadedThumbnail.secure_url,
          videoUrl: uploadedVideo.secure_url,
          tags: parsedTags,
          isFeatured: isFeatured,
          duration: duration,
        },
      });

      //  Send push notification to all users
      const res=await this.notificationService.broadcastToAll({
        title: '🎬 New Video Released!',
        body: dto.title,
        imageUrl: uploadedThumbnail.secure_url,
        deepLink: `/videos/${video.id}`, 
        contentType: 'video',
        contentId: video.id,
      });
      return video;
    } catch (error) {
      console.error('Cloudinary upload failed:', error);
      throw new Error(
        'Upload failed: ' + (error?.message || 'Unknown Cloudinary error'),
      );
    }
  }

  async getUpcomingContent() {
    const updates = await this.prisma.upcomingContent.findMany({
      orderBy: {
        releaseDate: 'asc',
      },
    });
    return updates;
  }

  async getAllVideos(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [videos, total, likedVideoIds] = await this.prisma.$transaction([
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
      this.prisma.like.findMany({
        where: { userId },
        select: { videoId: true },
      }),
    ]);

    const likedIdsSet = new Set(likedVideoIds.map((l) => l.videoId));

    const formattedVideos = videos.map((video) => ({
      ...video,
      likeCount: video._count.likes,
      isLiked: likedIdsSet.has(video.id),
    }));

    return {
      data: formattedVideos,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    dto: UpdateVideoDto,
    videoFile?: Express.Multer.File,
    thumbnailFile?: Express.Multer.File,
  ) {
    const existingVideo = await this.prisma.video.findUnique({ where: { id } });
    if (!existingVideo) {
      throw new NotFoundException('Video not found');
    }

    let videoUrl = existingVideo.videoUrl;
    let thumbnailUrl = existingVideo.thumbnailUrl;
    let duration = existingVideo.duration;

    if (videoFile) {
      const uploadedVideo = await this.uploadFileToCloudinary(videoFile);
      videoUrl = uploadedVideo.secure_url;
      duration = uploadedVideo.duration;
    }

    if (thumbnailFile) {
      const uploadedThumb = await this.uploadFileToCloudinary(thumbnailFile);
      thumbnailUrl = uploadedThumb.secure_url;
    }

    const parsedTags =
      typeof dto.tags === 'string'
        ? dto.tags.split(',').map((tag) => tag.trim())
        : dto.tags;
    let isFeatured: boolean | undefined;

    if (dto.isFeatured !== undefined) {
      isFeatured =
        typeof dto.isFeatured === 'string'
          ? dto.isFeatured.toLowerCase() === 'true'
          : !!dto.isFeatured;
    }

    const updatedVideo = await this.prisma.video.update({
      where: { id },
      data: {
        title: dto.title ?? existingVideo.title,
        description: dto.description ?? existingVideo.description,
        tags: parsedTags ?? existingVideo.tags,
        isFeatured:
          isFeatured !== undefined ? isFeatured : existingVideo.isFeatured,
        videoUrl,
        thumbnailUrl,
        duration,
      },
    });

    return updatedVideo;
  }

  async findFeaturedVideos(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [videos, total, likedVideoIds] = await this.prisma.$transaction([
      this.prisma.video.findMany({
        where: { isFeatured: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { likes: true },
          },
        },
      }),
      this.prisma.video.count({ where: { isFeatured: true } }),
      this.prisma.like.findMany({
        where: { userId },
        select: { videoId: true },
      }),
    ]);

    const likedIdsSet = new Set(likedVideoIds.map((l) => l.videoId));

    const formattedVideos = videos.map((video) => ({
      ...video,
      likeCount: video._count.likes,
      isLiked: likedIdsSet.has(video.id),
    }));

    return {
      data: formattedVideos,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async findRecentVideos(userId: string, page = 1, limit = 5) {
    const skip = (page - 1) * limit;

    const [videos, total, likedVideoIds] = await this.prisma.$transaction([
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
      this.prisma.like.findMany({
        where: { userId },
        select: { videoId: true },
      }),
    ]);

    const likedIdsSet = new Set(likedVideoIds.map((l) => l.videoId));

    const formattedVideos = videos.map((video) => ({
      ...video,
      likeCount: video._count.likes,
      isLiked: likedIdsSet.has(video.id),
    }));

    return {
      data: formattedVideos,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
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
      const video = await this.prisma.video.findUnique({
        where: { id: videoId },
      });

      if (!video) {
        throw new Error('Video not found');
      }

      const extractPublicId = (url: string) => {
        const parts = url.split('/');
        const publicIdWithExtension = parts[parts.length - 1];
        const publicId = publicIdWithExtension.split('.')[0];
        return (
          parts.slice(parts.length - 2, parts.length - 1)[0] + '/' + publicId
        );
      };

      const videoPublicId = extractPublicId(video.videoUrl);
      const thumbnailPublicId = extractPublicId(video.thumbnailUrl);

      await Promise.all([
        cloudinary.uploader.destroy(videoPublicId, { resource_type: 'video' }),
        cloudinary.uploader.destroy(thumbnailPublicId, {
          resource_type: 'image',
        }),
      ]);

      await this.prisma.like.deleteMany({
        where: {
          videoId,
        },
      });

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

    await this.prisma.like.create({
      data: {
        userId,
        videoId,
      },
    });

    const likeCount = await this.prisma.like.count({
      where: { videoId },
    });

    return {
      message: 'Video liked successfully',
      likeCount,
    };
  }

  async unlikeVideo(videoId: string, userId: string) {
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

  async searchVideos(query: string, userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [videos, total, likedVideoIds] = await this.prisma.$transaction([
      this.prisma.video.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } },
          ],
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { likes: true },
          },
        },
      }),
      this.prisma.video.count({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { tags: { has: query } },
          ],
        },
      }),
      this.prisma.like.findMany({
        where: { userId },
        select: { videoId: true },
      }),
    ]);

    const likedSet = new Set(likedVideoIds.map((item) => item.videoId));

    const formattedVideos = videos.map((video) => ({
      ...video,
      likeCount: video._count.likes,
      isLiked: likedSet.has(video.id),
    }));

    return {
      data: formattedVideos,
      total,
      page,
      pageCount: Math.ceil(total / limit),
    };
  }

  async getLikedVideos(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const likedVideos = await this.prisma.like.findMany({
      where: { userId },
      include: {
        video: true,
      },
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const result = likedVideos.map((like) => ({
      ...like.video,
      likedAt: like.createdAt,
    }));

    const totalCount = await this.prisma.like.count({ where: { userId } });

    return {
      data: result,
      meta: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }
}
