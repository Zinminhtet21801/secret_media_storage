import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService)) private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(user: any): Promise<any> {
    const { email, password } = user;

    const foundUser = await this.userService.findUser(email);
    if (foundUser && foundUser.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async signJWT(user: any) {
    // const payload = { email: user.email, id: user.id, password: user.password };
    // const payload = { email: user.email, id: user.id };

    const payload = { id: user.id, fullName: user.fullName, email: user.email };
    // const payload = { username: user.email, sub: user.id };
    const jwtToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET_KEY,
      // expiresIn: '60s',
    });
    return {
      access_token: jwtToken,
    };
  }

  async signRefreshJWT(user: any) {
    // const payload = { email: user.email, id: user.id };
    const payload = { id: user.id, fullName: user.fullName, email: user.email };
    const jwtToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET_KEY,
      expiresIn: '5days',
    });
    return {
      refreshToken: jwtToken,
    };
  }
}
