import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserVerificationsEntity } from '../auth/entities/user-verifications.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User , UserVerificationsEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
