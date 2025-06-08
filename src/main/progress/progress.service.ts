import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateProgressDto) {
    const { percentage } = dto;
    return this.prisma.progress.create({
      data: {
        ...dto,
        isCompleted: percentage >= 100,
      },
    });
  }

  async findAll() {
    return this.prisma.progress.findMany({
      include: {
        user: true,
        course: true,
        content: true,
      },
    });
  }

  async findAllByUser(userId: string) {
    return this.prisma.progress.findMany({
      where: { userId },
      include: {
        course: true,
        content: true,
      },
    });
  }

  async findOne(id: string) {
    const progress = await this.prisma.progress.findUnique({
      where: { id },
      include: {
        user: true,
        course: true,
        content: true,
      },
    });

    if (!progress) {
      throw new NotFoundException('Progress not found');
    }

    return progress;
  }

  async update(id: string, dto: UpdateProgressDto) {
    const isCompleted = dto.percentage !== undefined ? dto.percentage >= 100 : undefined;
  
    return this.prisma.progress.update({
      where: { id },
      data: {
        ...dto,
        ...(isCompleted !== undefined && { isCompleted }),
      },
    });
  }
  async remove(id: string) {
    return this.prisma.progress.delete({ where: { id } });
  }
}
