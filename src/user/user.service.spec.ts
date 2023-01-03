import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../auth/auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

export const userRepositoryMockFactory: () => jest.MockedFunction<any> = jest.fn(
  () => ({
    // findUser: jest.fn((entity) => entity),
    // login: jest.fn((entity) => entity),
    // hashPassword: jest.fn((entity) => entity),
    // saveUser: jest.fn((entity) => entity),
    // deleteUser: jest.fn((entity) => entity),
    // updateUser: jest.fn((entity) => entity),
    // contactUs: jest.fn((entity) => entity),
    // forgotPassword: jest.fn((entity) => entity),
    // resetPassword: jest.fn((entity) => entity),
    findOneBy: jest.fn((entity) => entity),
  }),
);

export const authServiceMockFactory: () => jest.MockedFunction<any> = jest.fn(
  () => ({
    validateUser: jest.fn((entity) => entity),
    signJWT: jest.fn((entity) => entity),
    signRefreshJWT: jest.fn((entity) => entity),

  }),
);

describe('UserService', () => {
  let service: UserService;
  let repositoryMock: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useFactory: userRepositoryMockFactory,
        },
        AuthService,
        {
          provide: ConfigService,
          useValue: authServiceMockFactory,
        },
        JwtService,
        {
          provide: DataSource,
          useValue: authServiceMockFactory,
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    repositoryMock = module.get(getRepositoryToken(User));
  });

  it('service should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find a user', async () => {
    const user = new User();
    const findUser = await service.findUser('zesty@gmail.com');
    console.log('====================================');
    console.log(findUser);
    console.log('====================================');
    // expect(findUser).toEqual(user);
  });
});
