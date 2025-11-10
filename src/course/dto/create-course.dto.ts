import { IsNotEmpty, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCourseDto {
  @IsNotEmpty()
  name: string;
  @IsOptional()
  description?: string;
  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber({}, { message: 'Price must be a valid number' })
  @Min(0, { message: 'Price must be at least 0' })
  @Max(100000, { message: 'Price must not exceed 100000' })
  price: number;
}
