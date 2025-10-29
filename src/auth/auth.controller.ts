import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import {
  TransformDto,
} from '../_cores/interceptors/transform-interceptor';
import {AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { Roles } from '../_cores/decorators/role.decorator';
import { UserRolesEnum } from '../_cores/enums/user-roles.enum';

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
}
