import { Module } from '@nestjs/common';
import { VideoUploadProcessor } from './video-upload.processor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from '../video/entities/video.entity';

import { SectionModule } from '../section/section.module';
import { CourseModule } from '../course/course.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ Video ]),
    CourseModule,
    SectionModule,
  ],
  providers: [VideoUploadProcessor]
})
export class WorkerModule {}
