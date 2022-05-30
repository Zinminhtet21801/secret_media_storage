import { Body, Controller, Post } from '@nestjs/common';
import { UserCreateDTO } from './dtos/user-create.dto';
import { UserDTO } from './dtos/user.dto';
import { Serialize } from '../interceptors/user.interceptor';
import { UserService } from './user.service';

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
}
