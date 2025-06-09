import { Module } from '@nestjs/common';
import { TermsService } from './terms.service';
import { TermsController } from './terms.controller';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TermsController],
  providers: [TermsService, PrismaService],
})
export class TermsModule {}
