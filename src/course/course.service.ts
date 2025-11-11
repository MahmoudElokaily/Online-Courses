import { Injectable, NotFoundException } from '@nestjs/common';
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
import { Roles } from '../_cores/decorators/role.decorator';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    private readonly userService: UserService,
  ) {}
  async create(
    createCourseDto: CreateCourseDto,
    currentUser: IUserPayload,
    cover: Express.Multer.File,
  ) {
    const { name, description, price } = createCourseDto;
    const user = await this.userService.findOneByUuid(currentUser.uuid);
    const course = this.courseRepository.create({
      name,
      description,
      price,
      instructor: { id: user.id },
    });
    // check cover
    if (cover) {
      const cleanName = name.replace(/\s+/g, '-');
      const fullName = `${Date.now()}-${cleanName}`;
      const uploadDir = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'courses',
        fullName,
      );
      // if file doesn't exit
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
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

  async findAll(limit: number, cursor?: string, search?: string) {
    // make max limit be 500
    limit = Math.min(limit, 500);
    const query = this.courseRepository
      .createQueryBuilder('course')
      .orderBy('createdAt', 'DESC')
      .limit(limit + 1);
    // search if exit
    if (search) {
      query.andWhere(
        '(course.name LIKE :search OR course.description LIKE :search)',
        { search: `%${search}%` },
      );
    }
    // pagination
    if (cursor) {
      query.andWhere('course.createdAt < :cursor', {
        cursor: new Date(cursor),
      });
    }
    // get items
    const courses = await query.getMany();

    // check next page
    const hasNextPage = courses.length > limit;
    // return only limit
    const items = hasNextPage ? courses.slice(0, limit) : courses;
    return {
      items: items,
      hasNextPage,
      cursor: hasNextPage ? items[items.length - 1].createdAt : null,
    };
  }

  async findOneUsingUuid(uuid: string) {
    const course = await this.courseRepository.findOneBy({ uuid });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(
    uuid: string,
    updateCourseDto: UpdateCourseDto,
    cover: Express.Multer.File,
  ) {
    const course = await this.findOneUsingUuid(uuid);
    // update other fields
    const courseCover = course.courseCover;
    Object.assign(course, updateCourseDto);
    if (cover) {
      const cleanName = course.name.replace(/\s+/g, '-');
      const fullName = `${Date.now()}-${cleanName}`;
      const uploadDir = path.join(
        __dirname,
        '..',
        '..',
        'uploads',
        'courses',
        fullName,
      );
      // if file doesn't exit
      if (!fs.existsSync(uploadDir))
        fs.mkdirSync(uploadDir, { recursive: true });
      // file name
      const fileName = `${Date.now()}${path.extname(cover.originalname)}`;
      const filePath = path.join(uploadDir, fileName);

      // save photo
      fs.writeFileSync(filePath, cover.buffer);
      // remove old avatar
      if (courseCover) {
        const oldCoverPath = path.join(__dirname, '..', '..', courseCover);
        const folderPath = path.dirname(oldCoverPath);

        if (fs.existsSync(folderPath)) {
          try {
            fs.rmSync(folderPath, { recursive: true, force: true });
          } catch (err) {
            console.warn('⚠️ Failed to delete folder:', err.message);
          }
        } else {
          console.log('⚠️ Folder does not exist:', folderPath);
        }
      }
      // save to user
      course.courseCover = `/uploads/courses/${fullName}/${fileName}`;
    }
    return this.courseRepository.save(course);
  }

  async remove(uuid: string) {
    const course = await this.findOneUsingUuid(uuid);
    if (course.courseCover) {
      const oldCoverPath = path.join(__dirname, '..', '..', course.courseCover);
      const folderPath = path.dirname(oldCoverPath);

      if (fs.existsSync(folderPath)) {
        try {
          fs.rmSync(folderPath, { recursive: true, force: true });
        } catch (err) {
          console.warn('⚠️ Failed to delete folder:', err.message);
        }
      } else {
        console.log('⚠️ Folder does not exist:', folderPath);
      }
    }
    await this.courseRepository.remove(course);
    // TODO :: remove sections of course and videos
  }
}
