import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import '../../config/cloudinary.config';

@Injectable()
export class CourseService {
  constructor(private prisma: PrismaService) {}

  private async uploadThumbnailToCloudinary(file: Express.Multer.File): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'course_thumbnails',
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

async create(dto: CreateCourseDto, file?: Express.Multer.File) {
  let thumbnailUrl: string | undefined;

  if (file) {
    thumbnailUrl = await this.uploadThumbnailToCloudinary(file);
  }

  // Type guard to safely handle category
  const category: string[] = Array.isArray(dto.category)
    ? dto.category
    : typeof dto.category === 'string'
    ? dto.category.split(',').map((tag) => tag.trim())
    : [];

  const isPaid =
    typeof dto.isPaid === 'string' ? dto.isPaid === 'true' : dto.isPaid;

  const data = {
    ...dto,
    isPaid,
    category,
    thumbnail: thumbnailUrl ?? dto.thumbnail,
  };

  return this.prisma.course.create({ data });
}

  findAll() {
    return this.prisma.course.findMany({ include: { modules: true } });
  }

  findOne(id: string) {
    return this.prisma.course.findUnique({ where: { id }, include: { modules: true } });
  }
}
