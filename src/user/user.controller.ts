import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Render,
  Res,
} from '@nestjs/common';
import { UserCreateDTO } from './dtos/user-create.dto';
import { UserDTO } from './dtos/user.dto';
import { Serialize } from '../interceptors/user.interceptor';
import { UserService } from './user.service';
import { Response } from 'express';

@Controller('user')
@Serialize(UserDTO)
export class UserController {
  constructor(private userService: UserService) {}
  @Post('create')
  async saveUser(@Body() body: UserCreateDTO) {
    const user = await this.userService.saveUser(body);
    return user;
  }

  @Post('login')
  async login(@Body() body: Partial<UserCreateDTO>) {
    console.log(body);

    const user = await this.userService.login(body.email, body.password);
    return user;
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
    console.log(email);

    return res.render('reset-password', {
      email: email,
    });
  }

  @Post('reset-password')
  async resetPassword(@Body() body: Partial<UserCreateDTO>) {
    console.log(body);
    
    const user = await this.userService.resetPassword(
      body.email,
      body.password,
    );
    return user;
  }
}
