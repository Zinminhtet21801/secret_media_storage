import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add your custom authentication logic here
    // for example, call super.logIn(request) to establish a session.
    const req = context.switchToHttp().getRequest();
    // console.log('====================================');
    // console.log(req?.headers?.cookie);
    // console.log('====================================');
    // if (!req?.headers?.authorization?.split(' ')[1]) {
    //   throw new UnauthorizedException();
    // }

    if (!req?.headers?.cookie?.split('=')[1]) {
      throw new UnauthorizedException();
    }

    return super.canActivate(context);
  }

  // handleRequest(err, user, info: Error, context: any, status: any) {
  //   if (err || info || !user) {
  //     // throw err || info || new UnauthorizedException();
  //     throw new UnauthorizedException();
  //   }

  //   return user;
  // }
}
