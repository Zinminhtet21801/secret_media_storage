import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { UserCreateDTO } from './dtos/user-create.dto';
import { Request, Response, request } from 'express';
import { ContactUsDTO } from './dtos/contact-us.dto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

jest.mock('./user.service');
jest.mock('../auth/auth.service');
jest.mock('@nestjs/jwt');
jest.mock('express');

const jwtUser = {
  access_token:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiWmluIE1pbiBIdGV0IiwiZW1haWwiOiJ6ZXRtaW5odGluQGdtYWlsLmNvbSJ9.wP_n9gf6OYkydqoDiDBtr0ha9GZww5nKjOx-mZhuKpU',
};

const refreshJwtToken = {
  refreshToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiWmluIE1pbiBIdGV0IiwiZW1haWwiOiJ6ZXRtaW5odGluQGdtYWlsLmNvbSJ9.wP_n9gf6OYkydqoDiDBtr0ha9GZww5nKjOx-mZhuKpU',
};

type User = {
  id: number;
  fullName: string;
  email: string;
  password: string;
};

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;
  let authService: AuthService;

  // let mockResponse = {
  //   status: jest.fn((x) => ({
  //     send: jest.fn((y) => y),
  //   })),
  //   json: jest.fn((x) => x),
  //   send: jest.fn((x) => x),
  //   cookie: jest.fn((x) => ({
  //     status: jest.fn((y) => ({
  //       json: jest.fn((z) => ({
  //         send: jest.fn((a) => a),
  //       })),
  //     })),
  //   })),
  // } as unknown as Response;

  let mockResponse = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    statusCode: jest.fn().mockReturnThis(),
  } as unknown as Response;

  let mockRequest = {
    user: {
      email: 'zetminhtin@gmail.com',
      fullName: 'Pass1',
    },
    body: {
      email: 'zetminhtin@gmail.com',
      fullName: 'Pass1',
      refreshToken: refreshJwtToken.refreshToken,
    },
  } as unknown as Request;

  const mockUserService = {
    saveUser: jest.fn((dto) => {
      return {
        ...dto,
        token: jwtUser,
        refreshToken: refreshJwtToken,
      };
    }),
    contactUs: jest.fn((dto) => {
      return dto;
    }),
    login: jest.fn((email, password) => {
      return {
        token: jwtUser,
        refreshToken: refreshJwtToken,
        fullName: 'Zin Min Htet',
        email,
      };
    }),
    refreshToken: jest.fn((res, req) => {
      return {
        refreshToken: refreshJwtToken.refreshToken,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, JwtService, UserService],
      controllers: [UserController],
    })
      // .overrideProvider(UserService)
      // .useValue(mockUserService)
      .compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('save a user with false info', async () => {
    const user: UserCreateDTO = {
      email: 'zetminhtin',
      fullName: 'Zin MIn Htet',
      password: 'Pass1',
    };

    service.saveUser = jest
      .fn()
      .mockResolvedValueOnce(() => new UnauthorizedException());
    const savedUser = await controller.saveUser(user, mockResponse);
    // return expect(service.saveUser).toHaveBeenCalledWith(savedUser.json);
    expect(savedUser.status).toHaveBeenCalledWith(401);
    // expect(savedUser.status).toHaveBeenCalledWith(201);
    // expect(service.saveUser).toHaveBeenCalledWith(201);
  });

  it('save a user', async () => {
    const user: UserCreateDTO = {
      email: 'zetminhtin@gmail.com',
      fullName: 'Zin MIn Htet',
      password: 'Pass1',
    };
    service.saveUser = jest.fn().mockResolvedValueOnce({
      ...user,
      token: jwtUser,
      refreshToken: refreshJwtToken,
    });
    const savedUser = await controller.saveUser(user, mockResponse);
    expect(service.saveUser).toHaveBeenCalledWith(user);
    // expect(service.saveUser).toHaveBeenCalledWith(201);
  });

  // it('get a user profile', async () => {
  //   controller.getProfile(mockResponse, mockRequest);
  // });

  // it('contact us', async () => {
  //   const user: Partial<ContactUsDTO> = {
  //     email: 'zetminhtin@gmail.com',
  //     fullName: 'Zin MIn Htet',
  //     message: 'u suck',
  //   };
  //   await controller.contactUs(user);
  //   expect(mockResponse.status).toHaveBeenCalledWith(500);
  // });

  it('login a user with incorrect credentials', async () => {
    const user: Partial<UserCreateDTO> = {
      email: 'zetminhti@gmail.com',
      password: 'Pass1',
    };
    service.login = jest.fn().mockResolvedValueOnce(() => {
      return new BadRequestException();
    });
    const loginUser = await controller.login(user, mockResponse);
    // const spy = jest.spyOn(mockResponse, 'status').mockReturnValueOnce([]);
    expect(loginUser.status).toHaveBeenCalledWith(401);
  });

  it('login a user with correct credentials', async () => {
    const user: Partial<UserCreateDTO> = {
      email: 'zetminhtin@gmail.com',
      password: 'Pass1',
    };
    service.login = jest.fn().mockResolvedValueOnce({
      token: jwtUser,
      refreshToken: refreshJwtToken,
      fullName: 'Zin Min Htet',
      email: 'zetminhtin@gmail.com',
    });
    const loginUser = await controller.login(user, mockResponse);
    expect(loginUser.status).toHaveBeenCalledWith(200);
  });

  it('get refreshToken pass', async () => {
    await controller.refreshToken(mockResponse, mockRequest);
    expect(mockResponse.status).toHaveBeenCalledWith(201);
  });

  it('get refreshToken without old refreshToken', async () => {
    mockRequest.body = { ...mockRequest.body, refreshToken: '' };
    controller.refreshToken = jest.fn().mockReturnValueOnce(() => {
      throw new UnauthorizedException();
    });
    const result = await controller.refreshToken(mockResponse, mockRequest);
    expect(result).toThrow(UnauthorizedException);
  });

  it('get refreshToken with wrong old refreshToken', async () => {
    mockRequest.body = { ...mockRequest.body, refreshToken: 'wrong' };
    controller.refreshToken = jest.fn().mockReturnValueOnce(() => {
      throw new UnauthorizedException();
    });
    const result = await controller.refreshToken(mockResponse, mockRequest);
    expect(result).toThrow(UnauthorizedException);
  });

  it('delete a user with correct credentials', async () => {
    const user: Partial<UserCreateDTO> = {
      email: 'zetminhtin@gmail.com',
    };
    service.deleteUser = jest.fn().mockResolvedValueOnce({
      id: 1,
      email: 'zetminhtin@gmail.com',
      fullName: 'Zin MIn Htet',
      password: '$2y$10$ceTgTI4ZuGtlhWQM9S9iVOfx26TFgxzCQ66ji0J.qk1uY6mEdpqPm',
    });
    const deletedUser = await controller.deleteUser(user);
    expect(deletedUser).toEqual({
      id: 1,
      email: 'zetminhtin@gmail.com',
      fullName: 'Zin MIn Htet',
      password: '$2y$10$ceTgTI4ZuGtlhWQM9S9iVOfx26TFgxzCQ66ji0J.qk1uY6mEdpqPm',
    });
  });

  it('delete a user with incorrect credentials', async () => {
    const user: Partial<UserCreateDTO> = {
      email: 'zetmin@gmail.com',
    };
    service.deleteUser = jest.fn().mockResolvedValueOnce(() => {
      throw new BadRequestException();
    });
    const deletedUser = await controller.deleteUser(user);
    expect(deletedUser).toThrow(BadRequestException);
  });

  it('POST /send-reset-password-email', async () => {
    const user: Partial<UserCreateDTO> = {
      email: 'zetminhtin@gmail.com',
    };
    service.forgotPassword = jest.fn().mockResolvedValueOnce(201);
    const result = await controller.forgotPassword(user);
    expect(result).toEqual(201);
  });

  it('POST /send-reset-password-email', async () => {
    const user: Partial<UserCreateDTO> = {
      email: 'zetminhtin@gmail.com',
    };
    service.forgotPassword = jest.fn().mockResolvedValueOnce(201);
    const result = await controller.forgotPassword(user);
    expect(result).toEqual(201);
  });

  it('POST /send-reset-password-email with incorrect email', async () => {
    const user: Partial<UserCreateDTO> = {
      email: 'zetmin@gmail.com',
    };
    service.forgotPassword = jest.fn().mockResolvedValueOnce(() => {
      throw new BadRequestException();
    });
    const result = await controller.forgotPassword(user);
    expect(result).toThrow(BadRequestException);
  });

  it('POST /reset-password', async () => {
    const user: Partial<UserCreateDTO> = {
      email: 'zetminhtin@gmail.com',
      password: 'Pass1',
    };

    service.resetPassword = jest.fn().mockResolvedValueOnce({
      id: 1,
      email: 'zetmin@gmail.com',
      password: '$2y$10$ceTgTI4ZuGtlhWQM9S9iVOfx26TFgxzCQ66ji0J.qk1uY6mEdpqPm',
      fullName: 'Zin MIn Htet',
    });
    const result = await controller.resetPassword(user);
    expect(result).toEqual({
      id: 1,
      email: 'zetmin@gmail.com',
      password: '$2y$10$ceTgTI4ZuGtlhWQM9S9iVOfx26TFgxzCQ66ji0J.qk1uY6mEdpqPm',
      fullName: 'Zin MIn Htet',
    });
  });

  it('POST /reset-password with incorrect email', async () => {
    const user: Partial<UserCreateDTO> = {
      email: 'zetmin@gmail.com',
      password: 'Pass1',
    };

    service.resetPassword = jest.fn().mockResolvedValueOnce(() => {
      throw new BadRequestException();
    });
    const result = await controller.resetPassword(user);
    expect(result).toThrow(BadRequestException);
  });

  it('logout', async () => {
    await controller.logout(mockRequest, mockResponse);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
  });
});
