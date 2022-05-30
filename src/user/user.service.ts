import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCreateDTO } from './dtos/user-create.dto';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  async findUser(email: string) {
    const user = await this.userRepo.findOne({ email: email });
    return user;
  }

  async login(email: string, password: string) {
    const user = await this.findUser(email);
    if (!user) {
      throw new BadRequestException('User not found!!!');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new BadRequestException('Password is incorrect!!!');
    }
    return user;
  }

  async hashPassword(password: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  }

  async saveUser(createUser: UserCreateDTO) {
    const existedUser = await this.findUser(createUser.email);
    if (existedUser) {
      throw new BadRequestException('User already exists!!!');
    }
    const incomingUser = {
      ...createUser,
      password: await this.hashPassword(createUser.password),
    };
    const user = await this.userRepo.insert(incomingUser);
    return user;
  }

  async deleteUser(email: string) {
    const user = await this.findUser(email);
    if (!user) {
      throw new BadRequestException('User not found!!!');
    }
    const deletedUser = await this.userRepo.delete(user.id);
    return deletedUser;
  }
}
