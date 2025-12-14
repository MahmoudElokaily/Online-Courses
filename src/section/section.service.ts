import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { Repository } from 'typeorm';
import { CourseService } from '../course/course.service';
import { Operations } from '../_cores/enums/operation.enum';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    @Inject(forwardRef(() => CourseService))
    private readonly courseService: CourseService,
  ) {}
  async create(uuid: string, createSectionDto: CreateSectionDto) {
    const { title } = createSectionDto;
    const course = await this.courseService.findOneUsingUuid(uuid);
    const savedCourse = this.sectionRepository.create({
      title,
      course,
    });
    return  this.sectionRepository.save(savedCourse);
  }

  async findAll(uuid: string) {
    const course = await this.courseService.findOneUsingUuid(uuid);
    return await this.sectionRepository.find({
      where: { course: { id: course.id } },
      relations: ['course'],
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(uuid: string) {
    const section = await this.sectionRepository.findOne({
      where: { uuid },
      relations: ['course' , 'videos'],
    });
    if (!section) throw new NotFoundException('Section not found');
    return section;
  }

  async update(uuid: string, updateSectionDto: CreateSectionDto) {
    const section = await this.findOne(uuid);
    Object.assign(section, updateSectionDto);
    return this.sectionRepository.save(section);
  }

  async remove(uuid: string) {
    const section = await this.findOne(uuid);
    await this.sectionRepository.remove(section);
    // TODO Remove videos also
    return { message: 'Section deleted successfully' };
  }

  removeSections(courseId: number) {
    return this.sectionRepository.delete({ course: { id: courseId } });
  }

  async updateTime(uuid: string, time: number, operation: Operations) {
    const value = operation === Operations.ADD ? time : -time;
    await this.sectionRepository.increment(
      { uuid },
      'time',
      value
    );
  }
  async updateLecture(uuid: string , operation: Operations ) {
    const value = operation === Operations.ADD ? 1 : -1;
    await this.sectionRepository.increment(
      { uuid },
      'totalLectures',
      value
    );
  }
}
