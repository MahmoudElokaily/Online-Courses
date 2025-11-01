import {
  Controller,
  Post,
  Body,
  UseGuards,
  Patch,
  Param,
  Delete,
  Get,
  Query,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import {
  TransformDto,
} from '../_cores/interceptors/transform-interceptor';
import {AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';


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
  sendVerificationMail(@Body('email') email: string) {
    return this.authService.verifyAccount(email);
  }
  @Get('verify')
  verify(@Query('token') token: string) {
    return this.authService.verified(token);
  }

}
