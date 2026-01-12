import { Expose, Type } from 'class-transformer';
import { SimpleUserDto } from '../../_cores/dtos/SimpleUserDto';
import { SimpleVideoDto } from '../../_cores/dtos/simple-video.dto';
import { SimpleCommentDto } from '../../_cores/dtos/simple-comment.dto';

export class CommentResponseDto {
  @Expose()
  uuid: string;

  @Expose()
  content: string;

  @Expose()
  @Type(() => SimpleUserDto)
  user: SimpleUserDto;

  @Expose()
  @Type(() => SimpleVideoDto)
  video: SimpleVideoDto;

  @Expose()
  @Type(() => SimpleCommentDto)
  parent: SimpleCommentDto | null;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
