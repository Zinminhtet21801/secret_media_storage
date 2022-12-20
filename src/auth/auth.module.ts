var dotenv = require('dotenv');
import { forwardRef, Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '../user/user.module';
import { AuthService } from '../auth/auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { UserService } from '../user/user.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

let parsed;

if (process.env.NODE_ENV === 'production') {
  parsed = {
    ETHEREAL_NAME: process.env.ETHEREAL_NAME,
    ETHEREAL_USERNAME: process.env.ETHEREAL_USERNAME,
    ETHEREAL_PASSWORD: process.env.ETHEREAL_PASSWORD,
    BASE_URL: process.env.BASE_URL,
    GMAIL_USERNAME: process.env.GMAIL_USERNAME,
    GMAIL_PASSWORD: process.env.GMAIL_PASSWORD,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY,
    JWT_EXPIRATION_TIME: process.env.JWT_EXPIRATION_TIME,
    FRONT_END_URL: process.env.FRONT_END_URL,
  };
} else {
  parsed = dotenv.config({ path: `.env.${process.env.NODE_ENV}` }).parsed;
}

@Module({
  imports: [
    forwardRef(() => UserModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: parsed.JWT_SECRET_KEY,
      secretOrPrivateKey: parsed.JWT_SECRET_KEY,
      // signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    JwtService,
    ConfigService,
    JwtAuthGuard,
  ],
  exports: [AuthService],
})
export class AuthModule {}
