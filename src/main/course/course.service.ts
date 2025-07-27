import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import '../../config/cloudinary.config';
import { UpdateCourseDto } from './dto/update-course.dto';

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

async findAll(page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const total = await this.prisma.course.count();

  const courses = await this.prisma.course.findMany({
    skip,
    take: limit,
    include: { modules: true },
    orderBy: { createdAt: 'desc' },
  });

  return {
    data: courses,
    total,
    page,
    pageCount: Math.ceil(total / limit),
  };
}
  findOne(id: string) {
    return this.prisma.course.findUnique({ where: { id }, include: { modules: true } });
  }

  async update(
  id: string,
  dto: UpdateCourseDto,
  file?: Express.Multer.File,
) {
  let thumbnailUrl: string | undefined;

  if (file) {
    thumbnailUrl = await this.uploadThumbnailToCloudinary(file);
  }

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

  return this.prisma.course.update({
    where: { id },
    data,
  });
}

async delete(id: string) {
  return this.prisma.course.delete({
    where: { id },
  });
}

async searchCourses(query = '', page = 1, limit = 10) {
  if (!query.trim()) {
    console.log('⚠️ Empty or missing search query');
    return {
      data: [],
      total: 0,
      page,
      pageCount: 0,
    };
  }

  const skip = (page - 1) * limit;

  const whereCondition = {
    OR: [
      {
        title: {
          contains: query,
          mode: 'insensitive' as const,
        },
      },
      {
        description: {
          contains: query,
          mode: 'insensitive' as const,
        },
      },
      {
        category: {
          has: query.toLowerCase(),
        },
      },
    ],
  };

  console.log('🔍 Final where condition:', JSON.stringify(whereCondition, null, 2));

  const total = await this.prisma.course.count({ where: whereCondition });
  const results = await this.prisma.course.findMany({
    where: whereCondition,
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      modules: true,
    },
  });

  console.log('✅ Total:', total, '| Returned:', results.length);

  return {
    data: results,
    total,
    page,
    pageCount: Math.ceil(total / limit),
  };
}

}
