import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
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
import { Request } from 'express';
let fs = require('fs-extra');
let referenceFileName = '';
let userEmail = '';
let mimeType = 'application';

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
          userEmail = email
          mimeType = file.mimetype.split('/')[0];
          const path = filePathHelpers({ email, file, mimeType });
          fs.mkdirsSync(path);
          callback(null, path);
        },
        filename: (req, file, cb) => {
          console.log(file);

          referenceFileName =
            file.originalname + '-' + Date.now() + mimes[file.mimetype];

          cb(null, file.originalname + '-' + Date.now() + mimes[file.mimetype]);
        },
      }),
    }),
  )
  async uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>) {
    const res = this.mediaService.uploadFiles(
      user,
      userEmail,
      referenceFileName,
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
}
