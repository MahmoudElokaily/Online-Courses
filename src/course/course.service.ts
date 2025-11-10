import { Injectable } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UserRolesEnum } from '../_cores/enums/user-roles.enum';
import { IUserPayload } from '../_cores/types/express';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from '../user/user.service';
import path from 'node:path';
import fs from 'node:fs';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly userService: UserService,
  ) {
  }
  async create(createCourseDto: CreateCourseDto , currentUser: IUserPayload , cover: Express.Multer.File) {
    const {name, description , price} = createCourseDto;
    const user = await this.userService.findOneByUuid(currentUser.uuid);
    const course = this.courseRepository.create({
      name,
      description,
      price,
      instructor: {id: user.id},
    });
    // check cover
    if (cover) {
      const cleanName = name.replace(/\s+/g, '-');
      const fullName = `${Date.now()}-${cleanName}`;
      const uploadDir = path.join(__dirname , '..' , '..' , 'uploads' , 'courses' ,   fullName);
      // if file doesn't exit
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
      // file name
      const fileName = `${Date.now()}${path.extname(cover.originalname)}`;
      const filePath = path.join(uploadDir, fileName);

      // save photo
      fs.writeFileSync(filePath, cover.buffer);

      // save to user
      course.courseCover = `/uploads/courses/${fullName}/${fileName}`;
    }
    return this.courseRepository.save(course);
  }

  findAll() {
    return `This action returns all course`;
  }

  findOne(id: number) {
    return `This action returns a #${id} course`;
  }

  update(id: number, updateCourseDto: UpdateCourseDto) {
    return `This action updates a #${id} course`;
  }

  remove(id: number) {
    return `This action removes a #${id} course`;
  }
}
