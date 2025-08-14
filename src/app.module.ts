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
import { ModuleService } from './main/module/module.service';
import { ModuleController } from './main/module/module.controller';
import { ModuleModule } from './main/module/module.module';
import { ContentController } from './main/content/content.controller';
import { ContentModule } from './main/content/content.module';
import { CourseModule } from './main/course/course.module';
import { CourseService } from './main/course/course.service';
import { ContentService } from './main/content/content.service';
import { ProgressController } from './main/progress/progress.controller';
import { ProgressModule } from './main/progress/progress.module';
import { FAQModule } from './main/faq/faq.module';
import { TermsModule } from './main/terms/terms.module';
import { PlanModule } from './main/plan/plan.module';
import { SubscriptionController } from './main/subscription/subscription.controller';
import { SubscriptionModule } from './main/subscription/subscription.module';
import { UserModule } from './main/user/user.module';
import { ConfigModule } from '@nestjs/config';
import { NotificationModule } from './main/notification/notification.module';
import { TwilioService } from './main/twilio/twilio.service';
import { TwilioModule } from './main/twilio/twilio.module';
import { VideoModule } from './main/video/video.module';
import { UpdateModule } from './main/update/update.module';
import { NotificationModule } from './main/notification/notification.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes .env available app-wide
    }),
    PrismaModule,
    AuthModule,
    ContactModule,
    QuoteModule,
    CourseModule,
    ModuleModule,
    ContentModule,
    ProgressModule,
    FAQModule,
    TermsModule,
    PlanModule,
    SubscriptionModule,
    UserModule,
    NotificationModule,
    TwilioModule,
    VideoModule,
    UpdateModule,
  ],
  controllers: [
    AppController,
    // SubscriptionController,
    // CourseController,
    // ModuleController,
    // ContentController,
  ],
  providers: [
    AppService,
    PrismaService,
    MailService,
    TwilioService,
    // ModuleService,
    // CourseService,
    // ContentService,
  ],
})
export class AppModule {}
