import { Module } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import {
  FirebaseAdmin,
  FirebaseAdminProvider,
} from 'src/firebase/firebase-admin.provider';

@Module({
  providers: [FirebaseAdminProvider, PrismaService, NotificationService],
  controllers: [NotificationController],
  exports: [NotificationService, FirebaseAdmin],
})
export class NotificationModule {}
