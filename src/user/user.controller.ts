import {
  Body,
  Controller,
  forwardRef,
  Get,
  Inject,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { UserCreateDTO } from './dtos/user-create.dto';
import { UserDTO } from './dtos/user.dto';
import { Serialize } from '../interceptors/user.interceptor';
import { UserService } from './user.service';
import { Request, Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthService } from '../auth/auth.service';
import { Cookies } from '../decorators/getCurrentUserCookie.decorator';
import customLogger from '../logger/logger';
import { ContactUsDTO } from './dtos/contact-us.dto';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

const isProdMode = process.env.NODE_ENV === 'production';

type SaveUserType = {
  token: {
    access_token: string;
  };
  refreshToken: {
    refreshToken: string;
  };
  fullName: string;
  email: string;
};

@ApiTags('User')
@Controller('user')
@Serialize(UserDTO)
// @UseGuards(JwtAuthGuard)
export class UserController {
  constructor(
    private userService: UserService,
    @Inject(forwardRef(() => AuthService)) private authService: AuthService,
  ) {}

  @Post('create')
  async saveUser(@Body() body: UserCreateDTO, @Res() res: Response) {
    const { email, fullName, token, refreshToken } =
      (await this.userService.saveUser(body)) as SaveUserType;
    if (!email) {
      return res.status(401).send();
    }
    res
      .cookie('token', token.access_token, {
        httpOnly: true,
        // Uncomment below to set a secure cookie via https
        sameSite: isProdMode ? 'none' : 'lax',
        secure: isProdMode ? true : false,
        // domain: isProdMode ? process.env.FRONT_END_DOMAIN : 'localhost',
        // path: '/',
        // expires: new Date(Date.now() + 200000 + +200000 + +200000),
      })
      .status(201)
      .json({
        fullName,
        email,
        refreshToken: refreshToken.refreshToken,
      })
      .send();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  // getProfile(@Cookies('token') token: string, @Res() res: Response, @Req() req: Request) {
  getProfile(@Res() res: Response, @Req() req: any) {
    // const {id, fullName, email } = req?.user
    res.json({
      fullName: req?.user?.fullName,
      email: req?.user?.email,
    });
  }

  @Post('contact')
  async contactUs(@Body() body: Partial<ContactUsDTO>) {
    const { email, fullName, message } = body;
    await this.userService.contactUs(email, fullName, message);
  }

  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          example: 'abcde@gmail.com',
          description: 'Email of the user',
        },
        password: {
          type: 'string',
          example: 'Abcde123',
          description: 'Password of the user',
        },
      },
    },
  })
  @ApiCreatedResponse({
    description: 'Login successful',
    type: UserDTO,
  })
  @ApiBadRequestResponse({
    description: 'Login failed',
  })
  async login(
    @Body() body: Partial<UserCreateDTO>,
    // @Res({ passthrough: true }) res: Response,
    @Res({ passthrough: false }) res: Response,
  ) {
    const { token, fullName, email, refreshToken } =
      (await this.userService.login(body.email, body.password)) as SaveUserType;

    if (!token) {
      return res.status(401).send();
    }

    return res
      .cookie('token', token?.access_token, {
        httpOnly: true,
        // Uncomment below to set a secure cookie via https
        sameSite: isProdMode ? 'none' : 'lax',
        secure: isProdMode ? true : false,
        // domain: isProdMode ? process.env.FRONT_END_DOMAIN : 'localhost',
        // path: '/',
        // expires: new Date(Date.now() + 200000 + +200000 + +200000),
      })
      .status(200)
      .json({
        fullName,
        email,
        refreshToken: refreshToken?.refreshToken,
      })
      .send();
    // customLogger.log('debug', 'Login successful');
    // return user;
  }

  @Get('refresh-token')
  async refreshToken(@Res() res: Response, @Req() req: Request) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        throw new UnauthorizedException();
      }
      const { refreshToken: signedRefreshToken } =
        await this.authService.signRefreshJWT(refreshToken);
      return res.status(201).json({
        refreshToken: signedRefreshToken,
      });
    } catch (error) {
      customLogger.log('error', error);
    }
  }

  @Post('delete')
  async deleteUser(@Body() body: Partial<UserCreateDTO>) {
    const user = await this.userService.deleteUser(body.email);
    return user;
  }

  @Post('send-reset-password-email')
  async forgotPassword(@Body() body: Partial<UserCreateDTO>) {
    const user = await this.userService.forgotPassword(body.email);
    return user;
  }

  @Get('reset-password/:email')
  root(@Res() res: Response, @Param('email') email: string) {
    return res.render('reset-password', {
      email: email,
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() body: Partial<UserCreateDTO>) {
    const user = await this.userService.resetPassword(
      body.email,
      body.password,
    );
    return user;
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    res
      .cookie('token', '', {
        httpOnly: true,
        // Uncomment below to set a secure cookie via https
        // sameSite: 'none',
        // secure: true,
        sameSite: isProdMode ? 'none' : 'lax',
        secure: isProdMode ? true : false,
        // domain: isProdMode ? process.env.FRONT_END_DOMAIN : 'localhost',
        // path: '/',
        // expires: new Date(Date.now() + 200000 + +200000 + +200000),
      })
      .status(200)
      .json({
        fullName: '',
        email: '',
      });
  }
}
