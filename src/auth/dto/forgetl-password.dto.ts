import {IsNotEmpty, MinLength } from 'class-validator';


export class ForgetPasswordDto {
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @MinLength(6)
  confirmPassword: string;
}