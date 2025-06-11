import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import * as dotenv from 'dotenv';
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ This catches all requests — including Stripe's — and preserves rawBody
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        if (req.headers['stripe-signature']) {
          req.rawBody = buf;
        }
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Prince LMS API')
    .setDescription('Authentication and LMS endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
