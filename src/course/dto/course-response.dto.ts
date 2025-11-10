import { Expose, Transform } from 'class-transformer';

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
  createdAt: string;
  @Expose()
  updatedAt: string;
}