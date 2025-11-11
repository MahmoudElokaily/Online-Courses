import { Global, Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Course } from '../course/entities/course.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User , Course]),
  ],
  providers: [ResourceService],
  exports: [ResourceService],

})
export class ResourceModule {}
