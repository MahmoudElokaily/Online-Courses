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
import { VideoResponseDto } from '../video/dto/video-response.dto';
import { Video } from '../video/entities/video.entity';
import { Comment } from '../comment/entities/comment.entity';


@Injectable()
export class ResourceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async getResource(resourceType: string, resourceId: string, method?: string , currentUser: any = {}) {
    switch (resourceType) {
      case 'users': {
        const user = await this.userRepository.findOneBy({ uuid: resourceId });
        if (!user) throw new NotFoundException('User not found');
        return user.uuid.toString();
      }
      case 'courses': {
        const course = await this.courseRepository.findOne({
          where: { uuid: resourceId },
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
      case 'videos': {
        if (method === 'POST') {
          const course = await this.courseRepository.findOne({
            where: { uuid: resourceId },
            relations: ['instructor'],
          });
          if (!course) {
            throw new NotFoundException('Section not found');
          }

          return course.instructor.uuid.toString();
        }
        const video = await this.videoRepository.findOne({
          where: { uuid: resourceId },
          relations: ['section', 'section.course', 'section.course.instructor'],
        });

        if (!video) {
          throw new NotFoundException('Video not found');
        }

        return video.section.course.instructor.uuid.toString();
      }
      case 'comments': {
        const comment = await this.commentRepository.findOne({
          where: { uuid: resourceId },
          relations: [
            'user',
            'video',
            'video.course',
            'video.course.instructor'
          ],
        });
        if (!comment) throw new NotFoundException('Comment not found');
        return comment.user.uuid.toString() === currentUser.uuid.toString() ? comment.user.uuid.toString() : comment.video.course.instructor.uuid.toString();
      }
      default:
        throw new Error('Resource not found');
    }
  }
}
