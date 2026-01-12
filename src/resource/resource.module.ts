import { Global, Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';
import { Section } from '../section/entities/section.entity';
import { Video } from '../video/entities/video.entity';
import { Comment } from '../comment/entities/comment.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User , Course , Section , Video , Comment]),
  ],
  providers: [ResourceService],
  exports: [ResourceService],

})
export class ResourceModule {}
