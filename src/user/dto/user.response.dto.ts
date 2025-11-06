import { Expose, Transform } from 'class-transformer';
import { UserRolesEnum } from '../../_cores/enums/user-roles.enum';

export class UserResponseDto {
  @Expose()
  uuid: string;
  @Expose()
  name: string;
  @Expose()
  email: string;
  @Expose()
  phoneNumber: string;
  @Expose()
  @Transform(({ obj }) => obj ? `${process.env.APP_URL}${obj.avatar}` : null)
  avatar: string | null;
  @Expose()
  bio: string | null;
  @Expose()
  role: UserRolesEnum;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}