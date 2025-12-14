import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { CourseModule } from '../course/course.module';
import { SectionModule } from '../section/section.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { BullModule } from '@nestjs/bull';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-upload',
    }),
    TypeOrmModule.forFeature([ Video ]),
    CourseModule,
    SectionModule,
    UserModule
  ],
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}
