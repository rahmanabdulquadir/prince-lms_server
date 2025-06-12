import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService, PrismaService],
  exports: [NotificationService],
})
export class NotificationModule {}
