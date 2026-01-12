import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { VideoService } from '../video/video.service';
import { UserService } from '../user/user.service';
import { IUserPayload } from '../_cores/types/express';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    private readonly videoService: VideoService,
    private readonly userService: UserService,
  ) {}

  async create(uuid:string ,createCommentDto: CreateCommentDto , currentUser: IUserPayload) {
    const {parent } = createCommentDto;
    const userData = await this.userService.findOneByUuid(currentUser.uuid);
    const videoData = await this.videoService.findOneByUuid(uuid);
    let parentComment: Comment | null = null;
    if (parent) {
      const parentData = await this.findCommentByUuid(parent);
       parentComment = parentData.parent ?? parentData;
    }
    const comment = this.commentRepository.create({
      user: userData,
      video: videoData,
      parent: parentComment,
      content: createCommentDto.content,
    });
    return this.commentRepository.save(comment);
  }

  findAll() {
    return this.commentRepository.find({ relations: ['parent' , 'user', 'video'] });
  }


  async findCommentByUuid(uuid: string) {
    const parent = await this.commentRepository.findOne({
      where: { uuid },
      relations: ['parent' , 'user' , 'video'],
    });
    if (!parent) throw new NotFoundException('Parent comment not found');
    return parent;
  }

  async update(uuid: string, updateCommentDto: UpdateCommentDto) {
    const {content} = updateCommentDto;
    const comment = await this.findCommentByUuid(uuid);
    if (!content) return comment;
    comment.content = content;
    await this.commentRepository.save(comment);
    return comment;
  }

  async remove(uuid: string) {
    const comment = await this.findCommentByUuid(uuid);
    await this.commentRepository.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
