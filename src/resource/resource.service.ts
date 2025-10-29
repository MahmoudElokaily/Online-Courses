import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';


@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getResource(resourceType: string, resourceId: number){
    switch(resourceType){
      case 'users': {
        const user = await this.userRepository.findOneBy({id: resourceId});
        if (!user) throw new NotFoundException('User not found');
        return user.id.toString();
      }
      default:
        throw new Error('Resource not found');
    }
  }
}
