import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

@Injectable()
export class ModuleService {
    private readonly logger = new Logger(ModuleService.name);
  constructor(private prisma: PrismaService) {}

  create(data: CreateModuleDto) {
    return this.prisma.module.create({ data });
  }

  // findByCourse(courseId: string) {
  //   return this.prisma.module.findMany({
  //     where: { courseId },
  //     include: { contents: true },
  //   });
  // }

 async getCourseModulesWithProgress(courseId: string, userId: string) {
    this.logger.log(`Fetching modules for course: ${courseId}`);

    const modules = await this.prisma.module.findMany({
      where: { courseId },
      orderBy: { createdAt: 'asc' }, // or change to your actual ordering field
      include: {
        contents: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!modules.length) {
      throw new NotFoundException('No modules found for this course');
    }

    const allContentIds = modules.flatMap(m => m.contents.map(c => c.id));

    const progress = await this.prisma.progress.findMany({
      where: {
        userId,
        contentId: { in: allContentIds },
      },
    });

    const progressByContent = new Map(progress.map(p => [p.contentId, p]));

    const processedModules = modules.map(module => {
      let allPreviousCompleted = true;

      const processedContents = module.contents.map(content => {
        const userProgress = progressByContent.get(content.id);
        const locked = !allPreviousCompleted;

        if (!locked && (!userProgress || !userProgress.isCompleted)) {
          allPreviousCompleted = false;
        }

        return {
          ...content,
          locked,
        };
      });

      return {
        ...module,
        contents: processedContents,
      };
    });

    this.logger.log(`Returning ${processedModules.length} modules with progress status`);
    return processedModules;
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
