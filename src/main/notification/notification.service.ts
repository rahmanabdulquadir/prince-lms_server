import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  constructor(private prisma: PrismaService) {}

async create(dto: CreateNotificationDto) {
  // Get all users who are subscribed (paid users)
  const subscribedUsers = await this.prisma.user.findMany({
    where: { isSubscribed: true },
    select: { id: true },
  });

  // Create a notification for each subscribed user
  const notifications = subscribedUsers.map((user) =>
    this.prisma.notification.create({
      data: {
        title: dto.title,
        message: dto.message,
        userId: user.id,
      },
    }),
  );

  return Promise.all(notifications);
}

  async findAllByUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }
}

