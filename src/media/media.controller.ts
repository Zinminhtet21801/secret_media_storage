import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DecryptedJWT } from '../assets/customTypes';
import { MediaService } from './media.service';
import { filePathHelpers } from './helpers/filepath.helpers';
import { Request, Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { S3Config, s3 } from './media.module';
import { orderBy } from 'lodash';

type User = { id: number; fullName: string; email: string };

export const decodingJWT = (token: string) => {
  console.log('decoding JWT token');
  if (token !== null || token !== undefined) {
    const base64String = token.split('.')[1];
    const decodedValue = JSON.parse(
      Buffer.from(base64String, 'base64').toString('ascii'),
    );
    // console.log(decodedValue);
    return decodedValue;
  }
  return null;
};

@ApiTags('Media')
@Controller('media')
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Post('checkFileExist')
  async checkFileExist(@Body() body: { name: string }, @Req() req: Request) {
    const { name } = body;
    const splittedJWT = req.headers.cookie.split('=')[1];
    const decodedUser = decodingJWT(splittedJWT);

    const isFileExist = await this.mediaService.checkFileExist(
      decodedUser,
      name,
    );
    if (isFileExist) {
      throw new HttpException('File already exist', 400);
    }
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Post('uploadFiles')
  async uploadFiles(@Req() req: Request, @Body() body) {
    const { fileName, location, mimeType } = body;
    const splittedJWT = req.headers.cookie.split('=')[1];
    const decodedUser = decodingJWT(splittedJWT);
    const { email } = decodedUser;
    const fileType = mimeType.split('/')[0];

    const res = await this.mediaService.uploadFiles(
      decodedUser,
      email,
      fileName,
      fileType,
      mimeType,
    );
    return res;
  }

  @Post('upload/initializeMultipartUpload')
  async initializeMultipartUpload(
    @Body() body: { name: string; mimeType: string },
    @Req() req: Request,
  ) {
    const { name, mimeType } = body;

    const splittedJWT = req.headers.cookie.split('=')[1];
    const decodedUser = decodingJWT(splittedJWT);
    const { email } = decodedUser;
    const fileType = mimeType.split('/')[0];
    const path = filePathHelpers({ email, fileType });
    const multipartParams = {
      Bucket: S3Config.bucketName,
      Key: `${path}/${name}`,
    };

    const { UploadId, Key } = await this.mediaService.initializeMultipartUpload(
      multipartParams,
    );
    return { fileId: UploadId, fileKey: Key, name, mimeType };
  }

  @Post('upload/getMultipartPresignedUrls')
  async getMultipartPreSignedUrls(
    @Body()
    body: {
      fileId: string;
      fileKey: string;
      parts: number;
      fileName: string;
      mimeType: string;
    },
  ) {
    const { fileKey, fileId, parts, fileName, mimeType } = body;
    const multipartParams = {
      Bucket: S3Config.bucketName,
      Key: fileKey,
      UploadId: fileId,
    };

    const partSignedUrlList = await this.mediaService.getMultipartPreSignedUrls(
      parts,
      multipartParams,
    );
    return {
      partSignedUrlList,
      fileName,
      mimeType,
    };
  }

  @Post('upload/finalizeMultipartUpload')
  async finalizeMultipartUpload(@Body() body, @Res() res: Response) {
    const { fileId, fileKey, parts, fileName, mimeType } = body;
    const multipartParams = {
      Bucket: S3Config.bucketName,
      Key: fileKey,
      UploadId: fileId,
      MultipartUpload: {
        // ordering the parts to make sure they are in the right order
        Parts: orderBy(parts, ['PartNumber'], ['asc']),
      },
    };

    const { Location } = await s3
      .completeMultipartUpload(multipartParams)
      .promise();

    // completeMultipartUploadOutput.Location represents the
    // URL to the resource just uploaded to the cloud storage
    res.json({ Location, fileName, mimeType }).send();
  }

  @UseGuards(JwtAuthGuard)
  @Get('getQuantity')
  async getQuantity(@Req() req: Request) {
    const { id: userId } = req?.user as User;
    const res = await this.mediaService.getQuantity(userId.toString());
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Get('getCategories/:category/page/:page')
  async getCategoriesItems(
    @Req() req: Request,
    @Param('category') category: string,
    @Param('page') page: string,
  ) {
    const { id: userId } = req?.user as User;
    const res = await this.mediaService.getCategoriesItems(
      userId,
      category,
      page,
    );
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('remove/:id')
  async removeMedia(@Req() req: Request, @Param('id') id: string) {
    const { id: userId, email } = req?.user as User;
    const res = await this.mediaService.deleteMediaItem(
      userId.toString(),
      email,
      id,
    );
    return res;
  }

  @UseGuards(JwtAuthGuard)
  @Get('download/:category/:id')
  async downloadMedia(
    @Req() req: Request,
    @Param('id') id: string,
    @Param('category') category: string,
    @Res({ passthrough: true }) response: Response,
    // @Res() response: Response,
  ): Promise<StreamableFile> {
    const { id: userId, email } = req?.user as User;
    const file = await this.mediaService.downloadMedia(
      userId,
      id,
      email,
      category,
    );

    const s3ObjParams = {
      Bucket: S3Config.bucketName,
      Key: `${email}/${category}/${file.name}`,
    };

    const { ContentLength } = await s3.headObject(s3ObjParams).promise();
    var fileStream = s3.getObject(s3ObjParams).createReadStream();
    response.set({
      'Content-Length': ContentLength,
    });
    response.contentType(file.mimeType);
    response.set({
      'Content-Disposition': `attachment; filename=${file.name}`,
    });

    return new StreamableFile(fileStream);
  }

  @UseGuards(JwtAuthGuard)
  @Get('search')
  async searchMedia(
    @Query('keyword') query: string,
    @Query('currentPage') currentPage: number,
    @Req() req: Request,
  ) {
    const { id } = req?.user as User;
    const res = await this.mediaService.searchMediaByUserID(
      id,
      query,
      currentPage,
    );
    return res;
  }
}
