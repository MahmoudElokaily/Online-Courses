import { Expose, Transform } from 'class-transformer';

export class SimpleUserDto {
  @Expose()
  uuid: string;
  @Expose()
  name: string;
  @Transform(({ obj }) => (obj ? `${process.env.APP_URL}${obj.avatar}` : null))
  avatar: string | null;
}