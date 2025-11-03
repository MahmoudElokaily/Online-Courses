import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';


import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { User } from '../user/entities/user.entity';
import { randomBytes } from 'node:crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserVerificationsEntity } from './entities/user-verifications.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { EmailActionDto } from './dto/email-action.dto';
import { ForgetPasswordDto } from './dto/forgetl-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { IUserPayload } from '../_cores/types/express';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(UserVerificationsEntity)
    private readonly verificationRepo: Repository<UserVerificationsEntity>,
    private readonly mailerService: MailerService,
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

  async verifyAccount(emailActionDto: EmailActionDto) {
    const {email} = emailActionDto;
    const user = await this.userService.findOneByEmail(email);
    // check if user belong us or not
    if (!user)  return { message: 'If this email exists, a verification link has been sent' };

    if (user.verifiedAt) return { message: 'If this email exists, a verification link has been sent' };

    const token = await this.createVerificationForUser(user , 'verify');
    const verifyLink = `${process.env.APP_URL}/auth/verify?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: "Forget Password",
      template: 'verify',
      context: {
        name: user.name,
        verifyLink,
        year: new Date().getFullYear()
      }
    });

    return { message: 'Verification email sent' };
  }

  async verified(token) {
    const verification = await this.verificationRepo.findOneBy({token});
    if (!verification)   throw new NotFoundException("You can't verify your account, please try again");
    // check expired or not
    const isExpired = new Date() > verification.expires_at;
    if (isExpired) {
      throw new BadRequestException('Verification token has expired');
    }
    // verify user email
    const user = this.userService.verifyEmail(verification.uuid);
    // delete token
    await this.verificationRepo.delete({ token });
    return { message: 'Account verified successfully' };
  }



  async sendForgetPasswordMail(emailActionDto: EmailActionDto) {
    const {email} = emailActionDto;
    const user = await this.userService.findOneByEmail(email);
    if (!user) return { message: 'If this email exists, a verification link has been sent' };

    const token = await this.createVerificationForUser(user , 'forget');
    const resetLink = `${process.env.APP_URL}/auth/new-password?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: "Verify your Account",
      template: 'forget',
      context: {
        name: user.name,
        resetLink,
        year: new Date().getFullYear()
      }
    });

    return { message: 'If this email exists, a verification link has been sent' };

  }

  async newPassword(token: string, forgetPasswordDto: ForgetPasswordDto) {
    const {password , confirmPassword} = forgetPasswordDto;
    const verification = await this.verificationRepo.findOneBy({token , type: 'forget'});
    if (!verification)   throw new NotFoundException("You can't Change Password, please try again");
    // check expired or not
    const isExpired = new Date() > verification.expires_at;
    if (isExpired) {
      throw new BadRequestException('Verification token has expired');
    }
    // check if passwords match
    if (password !== confirmPassword) throw new BadRequestException('Passwords do not match');
    // change password
    const user = await this.userService.changePassword(verification.uuid, password);

    // delete token
    await this.verificationRepo.delete({ token });
    return { message: 'Password change successfully' };
  }

  async changePassword(changePasswordDto: ChangePasswordDto , currentUser: IUserPayload) {
    const {oldPassword, newPassword , confirmPassword} = changePasswordDto;
    const user = await this.userService.findOneByUuid(currentUser.uuid);
    // check old password
    const isOldPasswordMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordMatch) {
      throw new BadRequestException('Old password is incorrect');
    }
    // check new passwords match
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('New password and confirmation do not match');
    }

    // change password
    await this.userService.changePassword(user.uuid , newPassword);

    return { message: 'Password change successfully' };
  }

  async createVerificationForUser(user: User , type: string) {
    const { uuid } = user;
    const token = randomBytes(32).toString('hex');

    let verification = await this.verificationRepo.findOneBy({ uuid , type: type});
    if (verification) {
      verification.token = token;
      verification.expires_at =  new Date(Date.now() + 15 * 60 * 1000);
    }
    else {
      verification = this.verificationRepo.create({
        token,
        uuid,
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
        'type': type,
      });
    }
    await this.verificationRepo.save(verification);
    return token;
  }
}
