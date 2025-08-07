import { Injectable } from '@nestjs/common';
import { CreateUpcomingContentDto } from './dto/create-upcoming-content.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UpdateService {
  constructor(private prisma: PrismaService) {}
  async createUpcomingContent(dto: CreateUpcomingContentDto) {
    const upcoming = await this.prisma.upcomingContent.create({
      data: {
        title: dto.title,
        description: dto.description,
        bannerImage: dto.bannerImage,
        releaseDate: dto.releaseDate,
        contentType: dto.contentType,
      },
    });

    return upcoming;
  }

  async getUpcomingContent() {
    const updates = await this.prisma.upcomingContent.findMany({
      orderBy: {
        releaseDate: 'asc',
      },
    });

    return updates;
  }
}
