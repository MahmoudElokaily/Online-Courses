import { UserRolesEnum } from '../enums/user-roles.enum';
import { SetMetadata } from '@nestjs/common';

export const Roles = (roles: UserRolesEnum[]) => SetMetadata('roles', roles);
