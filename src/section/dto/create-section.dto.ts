import { IsNotEmpty } from 'class-validator';

export class CreateSectionDto {
  @IsNotEmpty()
  title: string;
  @IsNotEmpty()
  course: string;
}
