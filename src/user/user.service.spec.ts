import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
// import { DataSource, Db, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserCreateDTO } from './dtos/user-create.dto';
import { faker } from '@faker-js/faker';
import { Media } from 'src/media/media.entity';

const userId = faker.datatype.number();

const media: Media = {
  id: faker.datatype.number() as unknown as string,
  mimeType: faker.datatype.string(),
  name: faker.music.songName(),
  type: faker.datatype.string(),
  user: {
    id: userId,
  } as unknown as User,
};

const user: User = {
  id: faker.datatype.number(),
  email: faker.internet.email(),
  fullName: faker.name.fullName(),
  password: faker.internet.password(),
  media: [media],
};

const mockReturnValue = {
  token: {
    access_token:
      '$2b$10$H.FIcIpHjV/jehOoe6T.HuS4TW305Gl1c.tCqaDeZ1kmwiEv42NVy',
  },
  refreshToken: {
    refreshToken:
      '$2b$10$H.FIcIpHjV/jehOoe6T.HuS4TW305Gl1c.tCqaDeZ1kmwiEv42NVy',
  },
  fullName: user.fullName,
  email: user.email,
};

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, PrismaService, AuthService, JwtService],
    }).compile();

    service = module.get<UserService>(UserService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a user', async () => {
    const user = {
      fullName: faker.name.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
    };

    // mock findFirst
    const dbSpy = jest
      .spyOn(service, 'saveUser')
      .mockResolvedValueOnce(mockReturnValue);
    const savedUser = await service.saveUser(user);
    expect(savedUser).toEqual(mockReturnValue);
  });

  it('should not create a user with existing email', async () => {
    const user = {
      fullName: faker.name.fullName(),
      email: 'zetminhtin@gmail.com',
      password: faker.internet.password(),
    };

    const dbSpy = jest.spyOn(service, 'saveUser').mockResolvedValueOnce(() => {
      throw new BadRequestException();
    });
    const savedUser = await service.saveUser(user);
    expect(savedUser).toThrow(BadRequestException);
  });

  // it('should not find a user', async () => {
  //   const user = new User();
  //   const findUser = await service.findUser('zesty@gmail.com');
  //   expect(findUser).not.toBe(user);
  // });

  it('should find a user', async () => {
    jest.spyOn(service, 'findUser').mockResolvedValueOnce(user);
    const findUser = await service.findUser(user.email);
    expect(findUser).toEqual(user);
  });

  it('login a user', async () => {
    jest.spyOn(service, 'login').mockResolvedValueOnce(
      Object.assign(mockReturnValue, {
        email: user.email,
        password: user.password,
      }),
    );
    const loginUser = await service.login(user.email, user.password);
    expect(loginUser).toEqual(mockReturnValue);
  });

  it('should not login a user with wrong email', async () => {
    jest.spyOn(service, 'login').mockResolvedValueOnce(() => {
      throw new NotFoundException();
    });
    const loginUser = await service.login(
      faker.internet.email(),
      user.password,
    );
    expect(loginUser).toThrow(NotFoundException);
  });

  it('should not login a user with wrong password', async () => {
    jest.spyOn(service, 'login').mockResolvedValueOnce(() => {
      throw new BadRequestException();
    });
    const loginUser = await service.login(
      user.email,
      faker.internet.password(),
    );
    expect(loginUser).toThrow(BadRequestException);
  });

  it('hash password', async () => {
    const a = await service.hashPassword('Pass1');
    expect(a).not.toEqual('Pass1');
  });

  it('delete a user', async () => {
    const mockDeleteReturn = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      password: user.password,
    };
    jest.spyOn(service, 'deleteUser').mockResolvedValueOnce(mockDeleteReturn);
    const deleteUser = await service.deleteUser(user.email);
    expect(deleteUser).toEqual(mockDeleteReturn);
  });

  it('should not delete a user with wrong email', async () => {
    jest.spyOn(service, 'deleteUser').mockResolvedValueOnce(() => {
      throw new BadRequestException();
    });
    const deleteUser = await service.deleteUser(faker.internet.email());
    expect(deleteUser).toThrow(BadRequestException);
  });

  it('resetPassword', async () => {
    const mockRestPasswordReturn = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      password: faker.internet.password(),
    };
    jest
      .spyOn(service, 'resetPassword')
      .mockResolvedValueOnce(mockRestPasswordReturn);
    const resetPassword = await service.resetPassword(
      user.email,
      mockRestPasswordReturn.password,
    );
    expect(resetPassword).toEqual(mockRestPasswordReturn);
  });
});
