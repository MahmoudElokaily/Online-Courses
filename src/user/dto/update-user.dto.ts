import { IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  name: string;
  @IsOptional()
  phoneNumber: string;
  @IsOptional()
  bio: string;
}
