import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Section } from '../../section/entities/section.entity';
import { Course } from '../../course/entities/course.entity';
import { v4 as uuidv4 } from 'uuid';
import { Comment } from '../../comment/entities/comment.entity';

@Entity('video')
export class Video {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'uuid' })
  uuid: string;
  @Column()
  title: string;
  @Column({ nullable: true })
  time: number;
  @ManyToOne(() => Section, (section) => section.videos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'section_id' })
  section: Section;

  @ManyToOne(() => Course, (course) => course.videos, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column()
  videoUrl: string;
  @Column({ type: 'int', default: 0 })
  size: number;

  @OneToMany(() => Comment, (comment) => comment.video)
  comments: Comment[];

  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateUUID() {
    this.uuid = uuidv4();
  }
}
