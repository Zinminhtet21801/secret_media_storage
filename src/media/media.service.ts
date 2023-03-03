import { HttpException, Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
import fs from 'fs';
import { AuthService } from '../auth/auth.service';
// import { In, Not, Repository } from 'typeorm';
import { fileTypeMatcherHelpers } from './helpers/filepath.helpers';
// import { Media } from './media.entity';
import { DecryptedJWT } from '../assets/customTypes';
import { PrismaService } from '../prisma/prisma.service';
import { S3Config, s3 } from './media.module';

const partSize = 5 * 1024 * 1024; // 5MB
const maxUploadTries = 3;

@Injectable()
export class MediaService {
  constructor(
    // @InjectRepository(Media) private mediaRepo: Repository<Media>,
    private readonly authService: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async getItemById(id: string) {
    try {
      // const res = await this.mediaRepo.findOne({
      //   where: {
      //     id,
      //   },
      // });
      const res = this.prisma.media.findFirst({
        where: {
          id: Number(id),
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async getItemByName(userId: number, name: string) {
    try {
      // const res = await this.mediaRepo.findOne({
      //   where: {
      //     user: {
      //       id: Number(userId),
      //     },
      //     name,
      //   },
      // });

      const res = await this.prisma.media.findFirst({
        where: {
          user: {
            id: Number(userId),
          },
          name,
        },
      });
      return res;
    } catch (error) {
      console.log(error);
    }
  }

  async checkFileExist(user: DecryptedJWT, fileName: string) {
    try {
      const isFileExist = await this.getItemByName(user.id, fileName);
      if (isFileExist) {
        return true;
      }
      return false;
    } catch (error) {
      console.log(error);
    }
  }

  async uploadFiles(
    user: DecryptedJWT,
    userEmail: string,
    fileName: string,
    fileType: string,
    mimeType: string,
  ) {
    const type = fileTypeMatcherHelpers({ fileType });
    // const checkFileExist = await this.getItemByName(user.id, fileName);
    // if (checkFileExist) {
    //   throw new HttpException('File already exist', 400);
    // }
    // const newFile = await this.mediaRepo.create({
    //   name: `${referenceFileName}`,
    //   user,
    //   type,
    //   mimeType,
    // });

    const res = await this.prisma.media.create({
      include: {
        user: true,
      },
      data: {
        name: `${fileName}`,
        user: {
          connect: {
            id: user.id,
          },
        },
        type,
        mimeType,
      },
    });

    // const res = await this.mediaRepo.save(newFile);
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
      // const res = await this.mediaRepo.findBy({
      //   user: {
      //     id: Number(userId),
      //   },
      // });

      const res = await this.prisma.media.findMany({
        where: {
          user: {
            id: Number(userId),
          },
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
      // const [res, length] = await this.mediaRepo.findAndCount({
      //   where: {
      //     user: {
      //       id: userId,
      //     },
      //     type:
      //       category === 'others'
      //         ? Not(In(['image', 'audio', 'video']))
      //         : category,
      //   },

      //   skip: (Number(page) - 1) * 10,
      //   take: 10,
      // });

      //TODO: Fix this

      const [res, length] = await this.prisma.$transaction([
        this.prisma.media.findMany({
          where: {
            user: {
              id: userId,
            },
            type:
              category === 'others'
                ? {
                    notIn: ['image', 'audio', 'video'],
                  }
                : category,
          },
          skip: (Number(page) - 1) * 10,
          take: 10,
        }),
        this.prisma.media.count({
          where: {
            user: {
              id: userId,
            },
            type:
              category === 'others'
                ? {
                    notIn: ['image', 'audio', 'video'],
                  }
                : category,
          },
        }),
      ]);

      // const res = await this.prisma.media.aggregate({
      //   _count: {
      //     id: true,
      //   },
      //   where: {
      //     user: {
      //       id: userId,
      //     },
      //     type:
      //       category === 'others'
      //         ? {
      //             notIn: ['image', 'audio', 'video'],
      //           }
      //         : category,
      //   },
      //   skip: (Number(page) - 1) * 10,
      //   take: 10,
      // });

      // const res = await this.prisma.media.findMany({
      //   where: {
      //     user: {
      //       id: userId,
      //     },
      //     type:
      //       category === 'others'
      //         ? {
      //             notIn: ['image', 'audio', 'video'],
      //           }
      //         : category,
      //   },
      //   skip: (Number(page) - 1) * 10,
      //   take: 10,

      // });

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
      if (!file) {
        return {
          message: 'File not found',
        };
      } else {
        // const res = await this.mediaRepo.delete({
        //   id: mediaId,
        // });

        const res = await this.prisma.media.delete({
          where: {
            id: Number(mediaId),
          },
        });

        s3.deleteObject(
          {
            Bucket: S3Config.bucketName,
            Key: `${email}/${file.type}/${file.name}`,
          },
          (err, data) => {
            console.log(err, data);
          },
        );

        // unlink(`./uploads/${email}/${file.type}/${file.name}`, (error) => {
        //   if (error) {
        //     console.log(error);
        //   }
        // });
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
    // const res = await this.mediaRepo.findOne({
    //   where: {
    //     id,
    //     user: {
    //       id: userId,
    //     },
    //   },
    // });

    const res = await this.prisma.media.findFirst({
      where: {
        id: Number(id),
        user: {
          id: userId,
        },
      },
    });

    return res;
  }

  // async getMultipartPreSignedUrls() {
  //   const { fileKey, fileId, parts } = req.body
  //   const multipartParams = {
  //   Bucket: BUCKET_NAME,
  //   Key: fileKey,
  //   UploadId: fileId,
  //   }const promises = []
  //   for (let index = 0; index < parts; index++) {
  //   promises.push(
  //   s3.getSignedUrlPromise("uploadPart", {
  //   ...multipartParams,
  //   PartNumber: index + 1,
  //   }),
  //   )
  //   }
  //   const signedUrls = await Promise.all(promises)
  //   // assign to each URL the index of the part to which it corresponds
  //   const partSignedUrlList = signedUrls.map((signedUrl, index) => {
  //   return {
  //   signedUrl: signedUrl,
  //   PartNumber: index + 1,
  //   }
  //   })
  //   res.send({
  //   parts: partSignedUrlList,
  //   })
  //   }

  async initializeMultipartUpload(multipartParams: {
    Bucket: string;
    Key: string;
  }) {
    const multipartUpload = await s3
      .createMultipartUpload(multipartParams)
      .promise();
    return multipartUpload;
  }

  async getMultipartPreSignedUrls(
    parts: number,
    multipartParams: {
      Bucket: string;
      Key: string;
      UploadId: string;
    },
  ) {
    const promises = [];
    for (let index = 0; index < parts; index++) {
      promises.push(
        s3.getSignedUrlPromise('uploadPart', {
          ...multipartParams,
          PartNumber: index + 1,
        }),
      );
    }
    const signedUrls = await Promise.all(promises);
    // assign to each URL the index of the part to which it corresponds
    const partSignedUrlList = signedUrls.map((signedUrl, index) => {
      return {
        signedUrl: signedUrl,
        PartNumber: index + 1,
      };
    });
    return {
      parts: partSignedUrlList,
    };
  }

  async startUpload(
    key: string,
    filePath: string,
    mimeType: string,
    fileSize: number,
  ) {
    // Initiate the multipart upload
    // const createUploadResponse = await s3
    //   .createMultipartUpload({
    //     Bucket: S3Config.bucketName,
    //     Key: key,
    //     ContentType: mimeType,
    //   })
    //   .promise();
    // const uploadId = createUploadResponse.UploadId;

    // Read the file and split it into parts
    console.log('====================================');
    console.log(filePath);
    console.log('====================================');
    const file = fs.createReadStream(filePath);
    let partNumber = 1;
    let uploadedBytes = 0;
    let parts = [];
    console.log('====================================');
    console.log(file);
    console.log('====================================');

    //TODO: Fix this

    // while (uploadedBytes < fileSize) {
    //   let end = uploadedBytes + partSize;
    //   let part = {
    //     Body: file.slice(uploadedBytes, end),
    //     PartNumber: String(partNumber),
    //   };
    //   parts.push(part);
    //   uploadedBytes = end;
    //   partNumber++;
    // }

    // // Upload the parts in parallel
    // const uploadPromises = parts.map(async (part) => {
    //   try {
    //     let uploadPartResponse = await s3
    //       .uploadPart({
    //         Bucket: S3Config.bucketName,
    //         Key: key,
    //         PartNumber: part.PartNumber,
    //         UploadId: uploadId,
    //         Body: part.Body,
    //       })
    //       .promise();
    //     return { ETag: uploadPartResponse.ETag, PartNumber: part.PartNumber };
    //   } catch (err) {
    //     console.log(`Error uploading part: ${part.PartNumber}`);
    //     throw err;
    //   }
    // });

    // // Wait for all parts to be uploaded
    // const partsInfo = await Promise.all(uploadPromises);

    // // Complete the multipart upload
    // await s3
    //   .completeMultipartUpload({
    //     Bucket: S3Config.bucketName,
    //     Key: key,
    //     UploadId: uploadId,
    //     MultipartUpload: {
    //       Parts: partsInfo,
    //     },
    //   })
    //   .promise();
  }

  async searchMediaByUserID(
    userId: number,
    query: string,
    currentPage: number,
  ) {
    const [res, length] = await this.prisma.$transaction([
      this.prisma.media.findMany({
        where: {
          user: {
            id: userId,
          },
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        skip: (Number(currentPage) - 1) * 10,
        take: 10,
      }),
      this.prisma.media.count({
        where: {
          user: {
            id: userId,
          },
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    return {
      res,
      length,
    };
  }
}
