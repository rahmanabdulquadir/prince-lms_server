import { Injectable } from "@nestjs/common";
import { CreateVideoDto } from "./dto/create-video.dto";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class VideoService {
  constructor(private prisma: PrismaService) {}

  async createVideo(dto: CreateVideoDto) {
    return this.prisma.video.create({ data: dto });
  }

  async getAllVideos(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [videos, total] = await this.prisma.$transaction([
      this.prisma.video.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.video.count(),
    ]);

    return { videos, total, page, limit };
  }

  async getFeaturedVideos() {
    return this.prisma.video.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getRecentVideos(limit = 6) {
    return this.prisma.video.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVideoById(id: string) {
    return this.prisma.video.findUnique({ where: { id } });
  }
}
