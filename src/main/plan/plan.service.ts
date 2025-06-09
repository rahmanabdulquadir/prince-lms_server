import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  create(data: CreatePlanDto) {
    return this.prisma.plan.create({ data });
  }

  findAll() {
    return this.prisma.plan.findMany({ where: { status: 'ACTIVE' } });
  }

  findOne(id: string) {
    return this.prisma.plan.findUnique({ where: { id } });
  }

  update(id: string, data: UpdatePlanDto) {
    return this.prisma.plan.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.plan.delete({ where: { id } });
  }
}
