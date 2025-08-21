import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { NotificationModule } from '../notification/notification.module';



@Module({
  imports:[NotificationModule],
  controllers: [VideoController],
  providers: [VideoService]
})
export class VideoModule {}
