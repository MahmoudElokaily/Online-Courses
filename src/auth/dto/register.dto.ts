import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { UserRolesEnum } from '../../_cores/enums/user-roles.enum';

export class RegisterDto {
  @IsNotEmpty()
  name: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @MinLength(8)
  password: string;
  @IsNotEmpty()
  @IsEnum(UserRolesEnum)
  role: UserRolesEnum;
  @IsOptional()
  bio: string;
  @IsOptional()
  phoneNumber: string;
}