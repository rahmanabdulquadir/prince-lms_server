import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';

@Module({
  controllers: [VideoController]
})
export class VideoModule {}
