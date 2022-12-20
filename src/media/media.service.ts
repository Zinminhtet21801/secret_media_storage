import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs';
import { AuthService } from 'src/auth/auth.service';
import { In, Not, Repository } from 'typeorm';
import { fileTypeMatcherHelpers } from './helpers/filepath.helpers';
import { Media } from './media.entity';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media) private mediaRepo: Repository<Media>,
    private readonly authService: AuthService,
  ) {}

  async getItemById(id: string) {
    try {
      const res = await this.mediaRepo.findOne({
        where: {
          id,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async getItemByName(name: string) {
    try {
      const res = await this.mediaRepo.findOne({
        where: {
          name,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async uploadFiles(
    user: object,
    userEmail: string,
    referenceFileName: string,
    fileType: string,
    mimeType: string,
  ) {
    const type = fileTypeMatcherHelpers({ fileType });
    const checkFileExist = await this.getItemByName(referenceFileName);
    if (checkFileExist) {
      throw new HttpException('File already exist', 400);
    }
    const newFile = await this.mediaRepo.create({
      name: `${referenceFileName}`,
      user,
      type,
      mimeType,
    });

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

  /**
   * It gets all the media items from the database that belong to a specific user and are of a specific
   * type
   * @param {number} userId - number, category: string
   * @param {string} category - string - this is the category of the media item.
   * @returns An array of media items
   */
  async getCategoriesItems(userId: number, category: string, page: string) {
    try {
      const [res, length] = await this.mediaRepo.findAndCount({
        where: {
          user: {
            id: userId.toString(),
          },
          type:
            category === 'others'
              ? Not(In(['image', 'audio', 'video']))
              : category,
        },

        skip: (Number(page) - 1) * 10,
        take: 10,
      });
      return {
        data: res,
        hasMore: length > Number(page) * 10,
      };
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * It deletes a media item from the database
   * @param {string} userId - The id of the user who is deleting the media item.
   * @param {string} mediaId - The id of the media item you want to delete.
   * @returns The number of rows affected by the delete operation.
   */
  async deleteMediaItem(userId: string, email: string, mediaId: string) {
    try {
      const file = await this.getItemById(mediaId);
      console.log('====================================');
      console.log(file);
      console.log('====================================');
      if (!file) {
        return {
          message: 'File not found',
        };
      } else {
        const res = await this.mediaRepo.delete({
          id: mediaId,
        });
        unlink(`./uploads/${email}/${file.type}/${file.name}`, (error) => {
          if (error) {
            console.log(error);
          }
        });
        // console.log(res);
        return res;
      }
    } catch (error) {
      console.log(error);
    }
  }

  async downloadMedia(
    userId: number,
    id: string,
    email: string,
    category: string,
  ) {
    const res = await this.mediaRepo.findOne({
      where: {
        id,
        user: {
          id: userId.toString(),
        },
      },
    });
    // const media = res.name.split(`${email}/`)[1];
    // return readFileSync(`./uploads/${email}/${category}/${media}`);
    // // return res;
    // const media = res.name.split(`${email}/`)[1];

    // return createReadStream(
    //   join(`./uploads/${email}/${category}/${res.name}`),
    //   {
    //     autoClose: true,
    //   },
    // );

    return res;
  }
}
