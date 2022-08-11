import {
  ClassSerializerInterceptor,
  Module,
  ValidationPipe,
} from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { MediaController } from './media/media.controller';
import { MediaService } from './media/media.service';
import { MediaModule } from './media/media.module';

@Module({
  imports: [
    ConfigModule.forRoot(
      process.env.NODE_ENV !== 'production'
        ? {
            isGlobal: true,
            envFilePath: `.env.${process.env.NODE_ENV}`,
          }
        : {},
    ),
    TypeOrmModule.forRoot(),
    UserModule,
    MediaModule,
    // AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
  ],
})
export class AppModule {}
