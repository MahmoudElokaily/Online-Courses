import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { IUserPayload } from '../types/express';
import { UserService } from '../../user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {
  }
  async canActivate(
    context: ExecutionContext,
  ):  Promise<boolean>  {
    console.log(1020);
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const decodedUser = await this.jwtService.verifyAsync(token);
      request.currentUser = {
        uuid: decodedUser.uuid,
        name: decodedUser.name,
        email: decodedUser.email,
        role: decodedUser.role,
      } as IUserPayload;

      const user = await this.userService.findOneByUuid(decodedUser.uuid);
      console.log(user);
      if (!user.verifiedAt) {
        throw new ForbiddenException('User account not verified');
      }

    }
    catch (err) {
      if (err instanceof ForbiddenException) {
        throw err;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
    return true;
  }
}
