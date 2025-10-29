import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';


import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
  }
  async register(registerDto: RegisterDto) {
    const {name ,  email, password , } = registerDto;
    // check if user exit
    const existingUser = await this.userService.findOneByEmail(email);
    if (existingUser) throw new ConflictException('Email already exists');
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // save user
    const user = await this.userService.create({...registerDto , password: hashedPassword});
    // Generate JWT
    const payload = {uuid: user.uuid, name: user.name, email: user.email, role:user.role};
    const token = this.jwtService.sign(payload);
    return {
      user,
      accessToken: token
    };
  }

  async login(loginDto: LoginDto) {
    const {email, password} = loginDto;
    // check user
    const user = await this.userService.findOneByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) throw new UnauthorizedException('Invalid credentials');

    // Generate Jwt
    const payload = {uuid: user.uuid, name: user.name, email: user.email , role:user.role};
    const token = this.jwtService.sign(payload);

    return {
      user,
      accessToken: token
    }


  }
}
