import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';


@Entity('user_verifications')
export class UserVerificationsEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  token: string;
  @Column({unique: true})
  uuid: string;
  @Column()
  expires_at: Date;
}
