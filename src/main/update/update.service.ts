import { Injectable } from '@nestjs/common';
import { CreateUpcomingContentDto } from './dto/create-upcoming-content.dto';
import { PrismaService } from '../prisma/prisma.service';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class UpdateService {
  constructor(private prisma: PrismaService) {}

  private async uploadBannerToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'upcoming_updates_banners',
        },
        (error, result) => {
          if (error) reject(error);
          else if (result?.secure_url) resolve(result.secure_url);
          else reject(new Error('No secure URL returned from Cloudinary'));
        },
      );
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  async createUpcomingContent(
    dto: CreateUpcomingContentDto,
    file?: Express.Multer.File,
  ) {
    let bannerImageUrl: string | undefined;

    if (file) {
      bannerImageUrl = await this.uploadBannerToCloudinary(file);
    }

    const upcoming = await this.prisma.upcomingContent.create({
      data: {
        title: dto.title,
        description: dto.description,
        bannerImage: bannerImageUrl ?? dto.bannerImage,
        releaseDate: dto.releaseDate,
        contentType: dto.contentType,
      },
    });

    return upcoming;
  }

  async getUpcomingContent() {
    return this.prisma.upcomingContent.findMany({
      orderBy: {
        releaseDate: 'asc',
      },
    });
  }

  async updateUpcomingContent(
    id: string,
    dto: CreateUpcomingContentDto,
    file?: Express.Multer.File,
  ) {
    let bannerImageUrl: string | undefined;
  
    if (file) {
      bannerImageUrl = await this.uploadBannerToCloudinary(file);
    }
  
    const updated = await this.prisma.upcomingContent.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        bannerImage: bannerImageUrl ?? dto.bannerImage,
        releaseDate: dto.releaseDate,
        contentType: dto.contentType,
      },
    });
  
    return updated;
  }
  
  async deleteUpcomingContent(id: string) {
    return this.prisma.upcomingContent.delete({
      where: { id },
    });
  }
}
