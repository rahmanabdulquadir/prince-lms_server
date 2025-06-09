import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTermsCategoryDto } from './dto/create-terms-category.dto';
import { CreateKeyPointDto } from './dto/create-key-point.dto';

@Injectable()
export class TermsService {
  constructor(private prisma: PrismaService) {}

  createCategory(dto: CreateTermsCategoryDto) {
    return this.prisma.termsCategory.create({
      data: {
        title: dto.title,
        lastUpdated: new Date(dto.lastUpdated),
      },
    });
  }

  getAllCategories() {
    return this.prisma.termsCategory.findMany({
      include: { keyPoints: true },
    });
  }

  createKeyPoint(dto: CreateKeyPointDto) {
    return this.prisma.keyPoint.create({ data: dto });
  }

  getKeyPointsByCategory(categoryId: string) {
    return this.prisma.keyPoint.findMany({
      where: { categoryId },
    });
  }

  deleteCategory(id: string) {
    return this.prisma.termsCategory.delete({ where: { id } });
  }

  deleteKeyPoint(id: string) {
    return this.prisma.keyPoint.delete({ where: { id } });
  }
}
