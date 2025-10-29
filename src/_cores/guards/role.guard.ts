import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/role.decorator';
import { Request } from 'express';
import { ResourceService } from '../../resource/resource.service';
import { UserRolesEnum } from '../enums/user-roles.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private resourceService: ResourceService,
  ) {}
  async canActivate(
    context: ExecutionContext,
  ):  Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const currentUser = request.currentUser;
    const resourceType = this.extractResource(request.path);
    if (!resourceType) {
      throw new BadRequestException(`Resource type not found`);
    }
    const requiredRoles = this.reflector.getAllAndOverride<UserRolesEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    if (requiredRoles.includes(UserRolesEnum.Admin) && currentUser?.role === UserRolesEnum.Admin) {
      return true;
    }
    if (requiredRoles.includes(UserRolesEnum.Student) && currentUser?.role === UserRolesEnum.Student) {
      const userIds = currentUser.id;
      const resourceId = request.params.id;
      const resourceIdOfUser = await this.resourceService.getResource(resourceType , +resourceId);

      if (!resourceIdOfUser) {
        throw new BadRequestException(`Resource type not found`);
      }
      if (userIds === resourceIdOfUser) return true;
      throw new ForbiddenException('You can only access your own resources');
    }
    throw new ForbiddenException("You don't have enough permissions");
  }

  private extractResource(path: string): string | null {
    const paths = path.split('/');
    if (paths.length > 3) {
      return paths[3]
    }
    return null;
  }
}
