import { IsEmail, IsNotEmpty } from 'class-validator';

export class EmailActionDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}