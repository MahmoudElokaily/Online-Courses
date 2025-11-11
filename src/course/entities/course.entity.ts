import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../user/entities/user.entity';
import { Section } from '../../section/entities/section.entity';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'uuid' , unique: true })
  uuid: string;
  @Column()
  name: string;
  @Column({ type: 'text', nullable: true })
  description?: string;
  @Column('decimal', { precision: 6, scale: 2 })
  price: number;
  @Column({ type: 'int', default: 0 })
  totalLectures: number;
  @ManyToOne(() => User, user => user.courses, { onDelete: 'CASCADE' })
  instructor: User;
  @OneToMany(() => Section, section => section.course, {
    cascade: true,
  })
  sections: Section[];
  @Column({nullable: true})
  courseCover?: string;
  @Column('decimal', { precision: 3, scale: 2, default: 0.00 })
  rating: number;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @BeforeInsert()
  generateUUID() {
    this.uuid = uuidv4();
  }

}
