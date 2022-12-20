import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Post,
  Req,
  Res,
  StreamableFile,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DecryptedJWT } from '../assets/customTypes';
import { mimes } from '../assets/mimeExtension';
import { MediaService } from './media.service';
import { filePathHelpers } from './helpers/filepath.helpers';
import { Request, Response } from 'express';
import { join } from 'path';
import { createReadStream, statSync } from 'fs';
import { ApiTags } from '@nestjs/swagger';
const fs = require('fs-extra');
let referenceFileName = '';
let userEmail = '';
let mimeType = 'application';
let fileType = 'application';

type User = { id: number; fullName: string; email: string };

let user: DecryptedJWT = {
  id: 0,
  fullName: '',
  email: '',
  iat: 0,
};

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

  @Post('uploadFiles')
  @UseInterceptors(
    AnyFilesInterceptor({
      dest: 'uploads',
      storage: diskStorage({
        destination: (req, file, callback) => {
          let type = req.params.type;
          const splittedJWT = req.headers.cookie.split('=')[1];
          user = decodingJWT(splittedJWT);
          const { email } = user;
          userEmail = email;
          mimeType = file.mimetype;
          fileType = file.mimetype.split('/')[0];
          const path = filePathHelpers({ email, fileType });
          fs.mkdirsSync(path);
          callback(null, path);
        },
        filename: (req, file, cb) => {
          console.log(file);

          referenceFileName = file.originalname;

          // cb(null, file.originalname + '-' + Date.now() + mimes[file.mimetype]);
          cb(null, file.originalname);
        },
      }),
    }),
  )
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const res = this.mediaService.uploadFiles(
      user,
      userEmail,
      referenceFileName,
      fileType,
      mimeType,
    );
    return res;
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
    // file.pipe(response)
    // const media = file.name.split(`${email}/`)[1];
    // response.download(`./uploads/${email}/${category}/${file.name}`);
    // response.setHeader('Content-Disposition', `attachment; filename=${media}`);
    // return response.download(`/${email}/${category}/${media}`);
    // response.contentType('image/*');
    // response.send(file);
    const streamFile = createReadStream(
      join(`./uploads/${email}/${category}/${file.name}`),
      {
        autoClose: true,
      },
    );

    response.contentType(file.mimeType);
    response.set({
      'Content-Length': statSync(`./uploads/${email}/${category}/${file.name}`)
        .size,
    });
    response.set({
      'Content-Disposition': `attachment; filename=${file.name}`,
    });
    return new StreamableFile(streamFile);

    // return response.send(file);
  }
}
