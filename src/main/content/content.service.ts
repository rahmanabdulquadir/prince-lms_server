import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContentDto } from './dto/create-content.dto';

@Injectable()
export class ContentService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateContentDto) {
    return this.prisma.content.create({ data });
  }

  findByModule(moduleId: string) {
    return this.prisma.content.findMany({
      where: { moduleId },
    });
  }
}
