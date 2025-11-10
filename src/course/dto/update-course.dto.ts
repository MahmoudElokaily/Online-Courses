import { IsOptional } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  name: string;
  @IsOptional()
  description: string;
  @IsOptional()
  price: number;
  @IsOptional()
  courseCover: string;
}
