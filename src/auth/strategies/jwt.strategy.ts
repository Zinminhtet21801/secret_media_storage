import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
dotenv.config();

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    configService: ConfigService,
  ) {
    super({
      // jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      jwtFromRequest: (req: Request) => req?.headers?.cookie?.split('=')[1],
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET_KEY'),
    });
  }

  // async validate(payload: any): Promise<any> {
  //   console.log(payload, 'JERE');

  //   if (!payload) {
  //     throw new UnauthorizedException();
  //   }
  //   return { email: payload.email };
  //   // console.log(user);

  //   // return user;
  // }

  async validate(payload: any) {
    console.log('====================================');
    console.log(payload, 'JERE');
    console.log('====================================');
    // This is where the req.user is set
    return { id: payload.id, fullName: payload.fullName, email: payload.email };
  }
}
