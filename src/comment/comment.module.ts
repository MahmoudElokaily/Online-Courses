import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { VideoModule } from '../video/video.module';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment]),
    VideoModule,
    UserModule
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
