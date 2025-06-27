import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

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

  findOne(id: string) {
    return this.prisma.module.findUnique({
      where: { id },
      include: { contents: true }, // include contents if you want full detail
    });
  }

  update(id: string, data: UpdateModuleDto) {
    return this.prisma.module.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.module.delete({
      where: { id },
    });
  }
}
