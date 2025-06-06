import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './main/auth/prisma/prisma.service';
import { PrismaModule } from './main/auth/prisma/prisma.module';
import { AuthModule } from './main/auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
