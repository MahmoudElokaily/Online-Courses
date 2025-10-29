import { Expose } from 'class-transformer';
import { UserRolesEnum } from '../../_cores/enums/user-roles.enum';

export class AuthResponseDto {
  @Expose()
  uuid: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  bio: string;
  @Expose()
  phoneNumber: string;
  @Expose()
  role: UserRolesEnum;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
  @Expose()
  accessToken: string;
}