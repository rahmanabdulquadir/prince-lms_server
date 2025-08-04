import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Express } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';
import '../../config/cloudinary.config';
import { UpdateCourseDto } from './dto/update-course.dto';
import { User } from '@prisma/client';

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

async findAll(user: User, page = 1, limit = 10) {
  const skip = (page - 1) * limit;

  const total = await this.prisma.course.count(); // no filter

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


  return {
    data: results,
    total,
    page,
    pageCount: Math.ceil(total / limit),
  };
}


async getInProgressCourses(userId: string) {
  const allCourses = await this.prisma.course.findMany({
    include: {
      modules: {
        include: {
          contents: true,
        },
      },
    },
  });

  console.log('🎓 All courses:', allCourses.length);

  const result: Array<
    typeof allCourses[number] & { progressPercent: number }
  > = [];

  for (const course of allCourses) {
    const allContents = course.modules.flatMap((m) => m.contents);
    const totalContents = allContents.length;

    console.log(`📚 Course "${course.title}" total contents:`, totalContents);

    if (totalContents === 0) continue;

    const contentIds = allContents.map((c) => c.id);

    const completedCount = await this.prisma.progress.count({
      where: {
        userId,
        contentId: {
          in: contentIds,
        },
        isCompleted: true,
      },
    });

    console.log(
      `✅ Completed contents for "${course.title}":`,
      completedCount
    );

    const progressPercent = Math.round(
      (completedCount / totalContents) * 100
    );

    console.log(`📈 Progress for "${course.title}": ${progressPercent}%`);

    // Only include if course is partially completed
    if (progressPercent > 0 && progressPercent < 100) {
      result.push({
        ...course,
        progressPercent,
      });
    }
  }

  console.log('📦 Final in-progress courses:', result.length);

  return result;
}


async getCompletedCourses(userId: string) {
  const allCourses = await this.prisma.course.findMany({
    include: {
      modules: {
        include: {
          contents: true,
        },
      },
    },
  });

  const result: Array<
    typeof allCourses[number] & { progressPercent: number }
  > = [];

  for (const course of allCourses) {
    const allContents = course.modules.flatMap((m) => m.contents);
    const totalContents = allContents.length;

    if (totalContents === 0) continue;

    const contentIds = allContents.map((c) => c.id);

    const completedCount = await this.prisma.progress.count({
      where: {
        userId,
        contentId: {
          in: contentIds,
        },
        isCompleted: true,
      },
    });

    if (completedCount === totalContents) {
      result.push({
        ...course,
        progressPercent: 100,
      });
    }
  }

  return result;
}
}
