import { forwardRef, Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MediaController } from './media.controller';
import { Media } from './media.entity';
import { MediaService } from './media.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { S3 } from 'aws-sdk';

export const s3 = new S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
});

export const S3Config = {
  bucketName: process.env.S3_BUCKET_NAME,
};

@Module({
  imports: [
    // TypeOrmModule.forFeature([Media]),
    PrismaModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
