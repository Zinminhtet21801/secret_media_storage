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
    mimeType: string,
  ) {
    const newFile = await this.mediaRepo.create({
      name: `${userEmail}/${referenceFileName}`,
      user: user,
      type: mimeType,
    });
    console.log(newFile, 'newFile', user);

    const res = await this.mediaRepo.save(newFile);
    return res;
  }

  async getQuantity(userId: string) {
    // write code to fetch the quantity
    const items = {
      audio: 0,
      image: 0,
      video: 0,
      others: 0,
    };

    try {
      const res = await this.mediaRepo.findBy({
        user: {
          id: userId,
        },
      });

      if (res.length === 0) {
        return items;
      } else {
        for (let i = 0; i < res.length; i++) {
          if (
            res[i].type === 'image' ||
            res[i].type === 'audio' ||
            res[i].type === 'video'
          ) {
            items[res[i].type]++;
          } else {
            items['others']++;
          }
        }
        return items;
      }
    } catch (e) {
      console.log(e);
    }
  }
}
