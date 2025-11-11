import { Expose } from 'class-transformer';

export class SectionResponseDto {
  @Expose()
  uuid: string;
  @Expose()
  title: string;
  @Expose()
  course: string;
  @Expose()
  totalLectures: number;
  @Expose()
  time: number;
  @Expose()
  createdAt: Date;
  @Expose()
  updatedAt: Date;
}