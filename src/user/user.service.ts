import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDto } from '../auth/dto/register.dto';
import * as bcrypt from 'bcrypt';
import { IUserPayload } from '../_cores/types/express';
import path from 'node:path';
import * as fs from 'node:fs';

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

  getMyProfile(currentUser: IUserPayload) {
    return this.findOneByUuid(currentUser.uuid);
  }

  findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async findAll(limit: number, cursor: string) {
    limit = Math.min(limit, 500);
    const query = this.userRepository
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'ASC')
      .addOrderBy('user.id', 'ASC')
      .take(limit + 1);

    // query using created at & id And check if cursor write valid
    if (cursor) {
      const parts = cursor.split('_');
      if (parts.length === 2) {
        // لازم يبقى date_id
        const [createdAt, id] = parts;
        query.andWhere(
          '(user.createdAt > :createdAt OR (user.createdAt = :createdAt AND user.id > :id))',
          { createdAt: new Date(createdAt), id: Number(id) },
        );
      }
    }

    const users = await query.getMany();

    // check has more or not
    const hasNextPage = users.length > limit;

    const lastUser = users[users.length - 1];
    const nextCursor = hasNextPage
      ? `${lastUser.createdAt.toISOString()}_${lastUser.id}`
      : null;
    // remove one extra
    if (hasNextPage) users.pop();

    return {
      items: users,
      hasNextPage,
      cursor: nextCursor,
    };
  }

  async findOneByUuid(uuid: string) {
    const user = await this.userRepository.findOneBy({ uuid });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async verifyEmail(uuid: string) {
    const user = await this.findOneByUuid(uuid);
    user.verifiedAt = new Date();
    return this.userRepository.save(user);
  }

  async update(currentUser: IUserPayload, updateUserDto: UpdateUserDto , avatar: Express.Multer.File) {
    const user = await this.findOneByUuid(currentUser.uuid);
    // remove any falsy value in dto
    for (const key in updateUserDto) {
      if (!updateUserDto[key]) {
        delete updateUserDto[key];
      }
    }
    if (avatar) {
      // dir to save
      const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'avatars' , `${currentUser.uuid}`);
      // if file doesn't exit
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      // file name
      const fileName = `${currentUser.uuid}-${Date.now()}${path.extname(avatar.originalname)}`;
      const filePath = path.join(uploadDir, fileName);

      // save photo
      fs.writeFileSync(filePath, avatar.buffer);

      // remove old avatar
      if (user.avatar) {
        const oldAvatarPath = path.join(__dirname, '..', '..', user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          try {
            fs.unlinkSync(oldAvatarPath);
          } catch (err) {
            console.warn('⚠️ Failed to delete old avatar:', err.message);
          }
        }
      }

      // save to user
      user.avatar = `/uploads/avatars/${user.uuid}/${fileName}`;
    }
    // other data save
    Object.assign(user, updateUserDto);
    // user save
    return this.userRepository.save(user);
  }

  async changePassword(uuid: string, password: string) {
    const user = await this.findOneByUuid(uuid);
    user.password = await bcrypt.hash(password, 10);
    return this.userRepository.save(user);
  }

  async remove(uuid: string) {
    const user = await this.findOneByUuid(uuid);
    await this.userRepository.softDelete(user.id);
  }
}
