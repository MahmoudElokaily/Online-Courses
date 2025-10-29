import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { IUserPayload } from '../types/express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService
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
    }
    catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
