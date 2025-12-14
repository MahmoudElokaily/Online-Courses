import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from './entities/video.entity';
import { Repository } from 'typeorm';
import { CourseService } from '../course/course.service';
import { SectionService } from '../section/section.service';
import path from 'node:path';
import { Operations } from '../_cores/enums/operation.enum';

@Injectable()
export class VideoService {
  constructor(
    @InjectQueue('video-upload') private videoUploadQueue: Queue,
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly courseService: CourseService,
    private readonly sectionService: SectionService,
  ) {}
  async uploadVideos(
    uuid: string,
    createVideoDto: CreateVideoDto,
    documents: Express.Multer.File[],
  ) {
    const course = await this.courseService.findOneUsingUuid(
      uuid
    );
    const section = await this.sectionService.findOne(createVideoDto.section);
    if (course.uuid !== section.course.uuid) {
      throw new BadRequestException('Section does not belong to this course');
    }
    if (!documents || documents.length === 0) {
      return { message: 'No files provided' };
    }
    if (createVideoDto.titles.length < documents.length) {
      throw new BadRequestException('Titles must be Equal documents');
    }
    const jobData = {
      dto: {
        course: course.uuid,
        section: createVideoDto.section,
      },
      documents: documents.map((file, index) => ({
        title:
          createVideoDto.titles?.[index] ?? path.parse(file.originalname).name,
        originalname: file.originalname,
        path: file.path, // important: disk path
        size: file.size,
      })),
    };

    // add job (fire-and-forget)
    await this.videoUploadQueue.add('upload-multiple', jobData, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 },
      removeOnComplete: true,
      removeOnFail: false,
    });

    return {
      message: 'Videos are being processed in background',
      total: documents.length,
    };
  }

  async deleteVideo(uuid: string) {
    const video = await this.videoRepository.findOne({
      where: { uuid },
      relations: ['section'],
    });
    if (!video) {
      throw new NotFoundException('Video not found');
    }
    const videoTime = video.time ?? 0;
    const sectionUuid = video.section.uuid;

    if (videoTime > 0) {
      await this.sectionService.updateTime(
        sectionUuid,
        videoTime,
        Operations.SUB,
      );
    }
    await this.sectionService.updateLecture(
      sectionUuid,
      Operations.SUB,
    );
    await this.videoRepository.remove(video);

  }
}
