import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthService } from 'src/auth/auth.service';
import { Repository } from 'typeorm';
import { Media } from './media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
    private readonly authService: AuthService,
  ) {}

  async uploadFiles(
    user: object,
    userEmail: string,
    referenceFileName: string,
  ) {
    const newFile = await this.mediaRepo.create({
      name: `${userEmail}/${referenceFileName}`,
      user: user,
    });
    console.log(newFile, 'newFile', user);
    
    const res = await this.mediaRepo.save(newFile);
    return res;
  }
}
