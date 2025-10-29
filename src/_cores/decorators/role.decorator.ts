import { Reflector } from '@nestjs/core';
import { UserRolesEnum } from '../enums/user-roles.enum';

export const Roles = Reflector.createDecorator<UserRolesEnum[]>();
