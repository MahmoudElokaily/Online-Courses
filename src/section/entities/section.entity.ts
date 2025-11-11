import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Course } from '../../course/entities/course.entity';

@Entity('sections')
export class Section {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'uuid' })
  uuid: string;
  @Column()
  title: string;
  @Column({ type: 'int', default: 0 })
  totalLectures: number;
  @Column({ type: 'decimal', precision: 4, scale: 2, default: 0 })
  time: number;
  @ManyToOne(() => Course, course => course.sections, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @BeforeInsert()
  generateUUID() {
    this.uuid = uuidv4();
  }
}
