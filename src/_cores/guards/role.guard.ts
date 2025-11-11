import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ResourceService } from '../../resource/resource.service';
import { UserRolesEnum } from '../enums/user-roles.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private resourceService: ResourceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const request = context.switchToHttp().getRequest<Request>();
    const currentUser = request.currentUser;
    const resourceType = this.extractResource(request.path);
    if (!resourceType) {
      throw new BadRequestException('Resource type not found');
    }
    const requiredRoles = this.reflector.getAllAndOverride<UserRolesEnum[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;

    // ✅ Admin access
    if (
      requiredRoles.includes(UserRolesEnum.Admin) &&
      currentUser?.role === UserRolesEnum.Admin
    ) {
      return true;
    }

    // ✅ Student & Instructor access only to their own resource
    if (
      (requiredRoles.includes(UserRolesEnum.Student) &&
      currentUser?.role === UserRolesEnum.Student) ||
      (requiredRoles.includes(UserRolesEnum.Instructor) &&
      currentUser?.role === UserRolesEnum.Instructor)
    ) {

      const resourceUuid = request.params.uuid;
      if (!resourceUuid) return true;


      const resourceOwnerUuid = await this.resourceService.getResource(resourceType, resourceUuid);
      if (!resourceOwnerUuid)
        throw new BadRequestException('Resource not found');

      if (currentUser.uuid === resourceOwnerUuid) return true;

      throw new ForbiddenException('You can only access your own resources');
    }


    throw new ForbiddenException("You don't have enough permissions");
  }

  private extractResource(path: string): string | null {
    const parts = path.split('/').filter(Boolean);
    return parts.at(-2) || parts.at(-1) || null;
  }
}
