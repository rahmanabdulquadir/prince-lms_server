import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './main/prisma/prisma.service';
import { PrismaModule } from './main/prisma/prisma.module';
import { AuthModule } from './main/auth/auth.module';
import { MailService } from './main/mail/mail.service';
import { ContactModule } from './main/contact/contact.module';
import { QuoteModule } from './main/quote/quote.module';
import { CourseController } from './main/course/course.controller';
import { CourseModule } from './main/course/course.module';

@Module({
  imports: [PrismaModule, AuthModule, ContactModule, QuoteModule, CourseModule],
  controllers: [AppController, CourseController],
  providers: [AppService, PrismaService, MailService],
})
export class AppModule {}
