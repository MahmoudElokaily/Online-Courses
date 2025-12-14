import { Expose, Type } from 'class-transformer';
import { CreateCourseDto } from '../../course/dto/create-course.dto';
import { CourseResponseDto } from '../../course/dto/course-response.dto';
import { VideoResponseDto } from '../../video/dto/video-response.dto';


export class SectionResponseDto {
  @Expose()
  uuid: string;
  @Expose()
  title: string;
  @Expose()
  totalLectures: number;
  @Expose()
  time: number;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
  @Type(() => CourseResponseDto)
  @Expose()
  course: CreateCourseDto;

  @Type(() => VideoResponseDto)
  @Expose()
  videos: VideoResponseDto;
}