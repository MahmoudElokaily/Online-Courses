import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';


@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async getResource(resourceType: string, resourceId: string){
    switch(resourceType){
      case 'users': {
        const user = await this.userRepository.findOneBy({uuid: resourceId});
        if (!user) throw new NotFoundException('User not found');
        return user.uuid.toString();
      }
      case 'courses': {
        const course = await this.courseRepository.findOne({
          where: {uuid: resourceId},
          relations: ['instructor'],
        });
        return course?.instructor.uuid.toString();
      }
      default:
        throw new Error('Resource not found');
    }
  }
}
