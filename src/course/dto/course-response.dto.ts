import { Expose, Transform, Type } from 'class-transformer';
import { SectionResponseDto } from '../../section/dto/section-response.dto';

export class CourseResponseDto {
  @Expose()
  uuid: string;
  @Expose()
  name: string;
  @Expose()
  description: string;
  @Expose()
  price: number;
  @Expose()
  totalLectures: number;
  @Expose()
  @Transform(({ obj }) => obj.courseCover ? `${process.env.APP_URL}${obj.courseCover}` : null)
  courseCover: string;
  @Expose()
  rating: string;
  @Expose()
  @Type(() => SectionResponseDto)
  sections: SectionResponseDto[];
  @Expose()
  createdAt: string;
  @Expose()
  updatedAt: string;
}