import { Expose } from 'class-transformer';

export class SimpleVideoDto {
  @Expose()
  title: string;
}