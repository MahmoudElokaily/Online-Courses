import { Controller, Post, Body, Get, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import {
  TransformDto,
} from '../_cores/interceptors/transform-interceptor';
import {AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { EmailActionDto } from './dto/email-action.dto';
import { ForgetPasswordDto } from './dto/forgetl-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CurrentUser } from '../_cores/decorators/current-user.decorator';
import type { IUserPayload } from '../_cores/types/express';
import { AuthGuard } from '../_cores/guards/auth.guard';


@Controller('auth')
@TransformDto(AuthResponseDto)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  create(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @Post('login')
  login(@Body() loginDto:LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('send-verification')
  sendVerificationMail(@Body() emailActionDto: EmailActionDto) {
    return this.authService.verifyAccount(emailActionDto)  ;
  }

  @Get('verify')
  verify(@Query('token') token: string) {
    return this.authService.verified(token);
  }

  @Post('forget-password')
  forgetPassword(@Body() emailActionDto: EmailActionDto) {
    return this.authService.sendForgetPasswordMail(emailActionDto);
  }

  @Post('new-password')
  NewPassword(@Query('token') token: string , @Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.newPassword(token , forgetPasswordDto);
  }

  @UseGuards(AuthGuard)
  @Post('change-password')
  changePassword(@Body() changePasswordDto: ChangePasswordDto , @CurrentUser() currentUser: IUserPayload) {
    return this.authService.changePassword(changePasswordDto , currentUser);
  }

}
