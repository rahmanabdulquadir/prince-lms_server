import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProfileDto) {
    return this.prisma.profile.create({
      data,
    });
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    return profile;
  }

  async update(userId: string, data: UpdateProfileDto) {
    return this.prisma.profile.update({
      where: { userId },
      data,
    });
  }

  async remove(userId: string) {
    return this.prisma.profile.delete({
      where: { userId },
    });
  }
}
