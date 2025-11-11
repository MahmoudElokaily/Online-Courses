import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import { Section } from '../section/entities/section.entity';


@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
  ) {}

  async getResource(resourceType: string, resourceId: string, method?: string) {
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
        if (!course) throw new NotFoundException('Course not found');
        return course?.instructor.uuid.toString();
      }
      case 'sections': {
        if (method === 'POST') {
          const course = await this.courseRepository.findOne({
            where: { uuid: resourceId },
            relations: ['instructor'],
          });
          if (!course) throw new NotFoundException('Course not found');
          return course.instructor.uuid.toString();
        }
        const section = await this.sectionRepository.findOne({
          where: { uuid: resourceId },
          relations: ['course', 'course.instructor'],
        });
        if (!section) throw new NotFoundException('Section not found');
        return section.course.instructor.uuid.toString();
      }
      default:
        throw new Error('Resource not found');
    }
  }
}
