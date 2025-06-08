import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';

@Injectable()
export class ModuleService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateModuleDto) {
    return this.prisma.module.create({ data });
  }

  findByCourse(courseId: string) {
    return this.prisma.module.findMany({
      where: { courseId },
      include: { contents: true },
    });
  }
}
