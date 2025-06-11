import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';
import { Express } from 'express';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContentDto, file: Express.Multer.File) {
    const videoUrl = `uploads/${file.filename}`; // adjust this if your URL structure is different

    const data = {
      ...dto,
      url: videoUrl, // required by your Prisma model
    };

    return this.prisma.content.create({ data });
  }

  findByModule(moduleId: string) {
    return this.prisma.content.findMany({
      where: { moduleId },
    });
  }
}
