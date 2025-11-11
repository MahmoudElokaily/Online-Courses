import { Injectable } from '@nestjs/common';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';
import { Repository } from 'typeorm';
import { CourseService } from '../course/course.service';

@Injectable()
export class SectionService {
  constructor(
    @InjectRepository(Section)
    private readonly sectionRepository: Repository<Section>,
    private readonly courseService: CourseService,
  ) {
  }
  async create(createSectionDto: CreateSectionDto) {
    const { title, course } = createSectionDto;
    const getCourse = await this.courseService.findOneUsingUuid(course);
    const savedCourse = this.sectionRepository.create({
      title,
      course: getCourse,
    });
    await this.sectionRepository.save(savedCourse);
  }

  findAll() {
    return `This action returns all section`;
  }

  findOne(id: number) {
    return `This action returns a #${id} section`;
  }

  update(id: number, updateSectionDto: UpdateSectionDto) {
    return `This action updates a #${id} section`;
  }

  remove(id: number) {
    return `This action removes a #${id} section`;
  }
}
