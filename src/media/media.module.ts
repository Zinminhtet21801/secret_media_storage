import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MediaController } from './media.controller';
import { Media } from './media.entity';
import { MediaService } from './media.service';

@Module({
  imports: [TypeOrmModule.forFeature([Media]), forwardRef(() => AuthModule)],
  controllers: [MediaController],
  providers: [MediaService],
  exports: [MediaService],
})
export class MediaModule {}
