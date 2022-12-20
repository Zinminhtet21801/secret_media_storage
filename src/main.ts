import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { join } from 'path';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const express = require('express');
const PORT = process.env.PORT || 5000;

console.log('====================================');
console.log(
  process.env.NODE_ENV === 'production'
    ? process.env.FRONT_END_URL
    : 'http://localhost:3000',
  { PORT },
);
console.log('====================================');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use('/uploads', express.static('uploads'));
  const config = new DocumentBuilder()
    .setTitle('Secret Media Storage API')
    .setDescription('API for Secret Media Storage')
    .setVersion('1.0')
    .addTag('secret-media-storage')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin:
      process.env.NODE_ENV === 'production'
        ? process.env.FRONT_END_URL
        : 'http://localhost:3000',
    credentials: true,
  });
  app.use(cookieParser(process.env.COOKIE_SECRET_KEY));
  app.use(helmet());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  await app.listen(PORT);
}
bootstrap();
