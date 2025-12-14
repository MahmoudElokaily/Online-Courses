import { Expose, Transform } from 'class-transformer';
import {
  formatFileSize,
  formatTime,
} from '../../_cores/utils/formaters';

export class VideoResponseDto {
  @Expose()
  title: string;
  @Expose()
  @Transform(({ value }) => formatTime(value))
  time: number;
  @Expose()
  @Transform(({ value }) => `${process.env.APP_URL}/${value}`)
  videoUrl: string;
  @Expose()
  @Transform(({ value }) => formatFileSize(value))
  size: number;
  @Expose()
  created_at: Date;
  @Expose()
  updated_at: Date;
}

