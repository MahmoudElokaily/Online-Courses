import { Injectable, NotFoundException } from '@nestjs/common';
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
  async create(uuid:string , createSectionDto: CreateSectionDto) {
    const { title } = createSectionDto;
    const course = await this.courseService.findOneUsingUuid(uuid);
    const savedCourse = this.sectionRepository.create({
      title,
      course,
    });
    await this.sectionRepository.save(savedCourse);
  }

  findAll() {
    return `This action returns all section`;
  }

  async findOne(uuid: string) {
    const section = await this.sectionRepository.findOneBy({ uuid });
    if (!section) throw new NotFoundException("Section not found");
    return section;
  }

  update(id: number, updateSectionDto: UpdateSectionDto) {
    return `This action updates a #${id} section`;
  }

  remove(id: number) {
    return `This action removes a #${id} section`;
  }
}
