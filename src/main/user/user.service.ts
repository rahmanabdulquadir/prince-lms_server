import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import '../../config/cloudinary.config';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  private async uploadPhotoToCloudinary(
    file: Express.Multer.File,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'user_photos',
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

  async getAllUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        role: true,
        isSubscribed: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        photo: true,
        role: true,
        isSubscribed: true,
        progresses: true,
        FavoriteContents: true,
        likedVideos: {
          include: {
            video: true,
          },
        },
        notifications: true,
        SavedQuotes: true,
        createdAt: true,
        updatedAt: true,
        subscriptions: {
          include: {
            plan: true,
          },
        },
      },
    });
  }

  async updateMe(
    userId: string,
    dto: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    let photoUrl: string | undefined;

    if (file) {
      photoUrl = await this.uploadPhotoToCloudinary(file);
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...dto,
        ...(photoUrl ? { photo: photoUrl } : {}),
      },
    });
  }
}
