import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFAQDto } from './dto/create-faq-dto';
import { CreateFAQCategoryDto } from './dto/create-faq-category.dto';

@Injectable()
export class FAQService {
  constructor(private prisma: PrismaService) {}

  createCategory(dto: CreateFAQCategoryDto) {
    return this.prisma.fAQCategory.create({ data: dto });
  }

  findAllCategories() {
    return this.prisma.fAQCategory.findMany({
      include: { faqs: true },
    });
  }

  createFAQ(dto: CreateFAQDto) {
    return this.prisma.fAQ.create({ data: dto });
  }

  findAllFAQs() {
    return this.prisma.fAQ.findMany({
      include: { category: true },
    });
  }

  findFAQsByCategory(categoryId: string) {
    return this.prisma.fAQ.findMany({
      where: { categoryId },
    });
  }

  deleteFAQ(id: string) {
    return this.prisma.fAQ.delete({ where: { id } });
  }

  deleteCategory(id: string) {
    return this.prisma.fAQCategory.delete({ where: { id } });
  }
}
