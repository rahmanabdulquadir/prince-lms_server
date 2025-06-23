import { Module } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
