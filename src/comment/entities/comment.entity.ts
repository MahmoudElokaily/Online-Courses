import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Video } from '../../video/entities/video.entity';
import { User } from '../../user/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ type: 'uuid', unique: true, nullable: false })
  uuid: string;
  // course
  @ManyToOne(() => Video, (video) => video.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'video_id' })
  video: Video;
  // user
  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // 🔁 Self relation (Reply)
  @ManyToOne(() => Comment, (comment) => comment.id, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment | null;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
  @CreateDateColumn()
  updatedAt: Date;
  @BeforeInsert()
  generateUUID() {
    this.uuid = uuidv4();
  }
}
