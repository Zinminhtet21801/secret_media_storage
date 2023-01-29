import { Test, TestingModule } from '@nestjs/testing';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { AuthService } from '../auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { request } from 'express';
import { User } from '../user/user.entity';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// mocking the necessary services in stead of mocking manually
jest.mock('./media.service');
jest.mock('../auth/auth.service');
jest.mock('@nestjs/jwt');
jest.mock('express');

type QuantityType = {
  audio: number;
  image: number;
  video: number;
  others: number;
};

describe('MediaController', () => {
  let controller: MediaController;
  let mediaService: MediaService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MediaService, AuthService, JwtService],
      controllers: [MediaController],
    }).compile();

    controller = module.get<MediaController>(MediaController);
    mediaService = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getQuantity', async () => {
    mediaService.getCategoriesItems = jest.fn().mockResolvedValueOnce(() => {
      throw new UnauthorizedException();
    });

    request.user = {
      id: 1,
      fullName: 'test',
      email: 'testing@gmail.com',
    };
    const quantity = await controller.getQuantity(request);
    expect(quantity).toThrow(UnauthorizedException);
  });
});
