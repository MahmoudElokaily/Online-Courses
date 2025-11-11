import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { UserModule } from '../user/user.module';
import { forwardRef } from '@nestjs/common';
import { SectionModule } from '../section/section.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    UserModule,
    forwardRef(() => SectionModule),
  ],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}
