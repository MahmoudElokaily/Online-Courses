import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserRolesEnum } from '../../_cores/enums/user-roles.enum';
import { v4 as uuidv4 } from 'uuid';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({type: 'uuid', unique: true})
  uuid: string;
  @Column()
  name: string;
  @Column({unique: true})
  email: string;
  @Column()
  password: string;
  @Column({nullable: true})
  phoneNumber?: string;
  @Column({nullable: true})
  avatar?: string;
  @Column({nullable: true})
  bio?: string;
  @Column({type: 'enum', enum: UserRolesEnum , default: UserRolesEnum.Student})
  role: UserRolesEnum;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn({nullable: true})
  deletedAt: Date;
  @BeforeInsert()
  generateUUID() {
    this.uuid = uuidv4();
  }
}
