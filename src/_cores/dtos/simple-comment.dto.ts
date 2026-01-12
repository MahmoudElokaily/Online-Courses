import { Expose } from 'class-transformer';

export class SimpleCommentDto {
  @Expose()
  uuid: string;
  @Expose()
  content: string;
}