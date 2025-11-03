import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

  ) {}
  create(data: RegisterDto) {
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }



  async findOneByUuid(uuid: string) {
    const user  = await this.userRepository.findOneBy({ uuid });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async verifyEmail(uuid: string) {
    const user = await this.findOneByUuid(uuid);
    user.verifiedAt = new Date();
    return this.userRepository.save(user);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async changePassword(uuid: string, password: string) {
    const user = await this.findOneByUuid(uuid);
    user.password = await bcrypt.hash(password, 10);
    return this.userRepository.save(user);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }


}
