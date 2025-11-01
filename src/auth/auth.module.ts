import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from '../_cores/guards/auth.guard';
import { ResourceModule } from '../resource/resource.module';
import { MailModule } from '../mail/mail.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserVerificationsEntity } from './entities/user-verifications.entity';

@Module({
  imports: [
    UserModule,
    ResourceModule,
    MailModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET')!,
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRED_IN')! as any },
      }),
    }),
    TypeOrmModule.forFeature([UserVerificationsEntity]),

  ],
  controllers: [AuthController],
  providers: [AuthService , AuthGuard],
  exports: [JwtModule , AuthGuard],
})
export class AuthModule {}
