import { forwardRef, Module } from '@nestjs/common';
import { SectionService } from './section.service';
import { SectionController } from './section.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Section } from './entities/section.entity';

import { CourseModule } from '../course/course.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Section]),
    forwardRef(() => CourseModule),
    UserModule,
  ],
  controllers: [SectionController],
  providers: [SectionService],
  exports: [SectionService],
})
export class SectionModule {}
