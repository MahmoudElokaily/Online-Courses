import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Video } from '../video/entities/video.entity';
import { Repository } from 'typeorm';
import { CourseService } from '../course/course.service';
import { SectionService } from '../section/section.service';
import { getVideoDuration } from '../_cores/utils/video.utils';
import { Operations } from '../_cores/enums/operation.enum';

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

@Processor('video-upload')
export class VideoUploadProcessor {
  constructor(
    @InjectRepository(Video)
    private readonly videoRepository: Repository<Video>,
    private readonly courseService: CourseService,
    private readonly sectionService: SectionService,
  ) {}
  @Process('upload-multiple')
  async handleUpload(job: Job) {
    const { dto, documents } = job.data as {
      dto: { course: string; section: string };
      documents: {
        title: string;
        originalname: string;
        path: string;
        size: number;
      }[];
    };

    console.log(`🚀 Processing job #${job.id}...`);

    const course = await this.courseService.findOneUsingUuid(dto.course);
    const section = await this.sectionService.findOne(dto.section);
    if (course.uuid !== section.course.uuid) {
      console.error('❌ Section does not belong to this course');
      return;
    }

    if (!course || !section) {
      console.error('❌ Course or Section not found. Aborting job.');
      return;
    }

    const uploadDir = path.join(
      process.cwd(),
      'uploads',
      'documents',
      dto.course,
      dto.section,
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    for (const document of documents) {
      if (!document.path) {
        console.warn('⚠️ Skipping video (no path):', document.originalname);
        continue;
      }

      const filename = `${Date.now()}-${document.originalname}`;
      const finalPath = path.join(uploadDir, filename);

      // نقل من tmp إلى المكان النهائي
      await fs.promises.copyFile(document.path, finalPath);
      console.log(`📥 Moved From : ${document.path} To -> ${finalPath}`);

      let duration: number = 600;
      if (this.isVideo(finalPath)) {
        duration = await getVideoDuration(finalPath);
      }

      // حذف الملف المؤقت
      try {
        await fs.promises.unlink(document.path);
      } catch (e) {
        console.warn('Could not delete tmp file:', document.path);
      }

      // حفظ سجل الفيديو في قاعدة البيانات
      const record = this.videoRepository.create({
        title: document.title,
        videoUrl: path
          .join('uploads', 'documents', dto.course, dto.section, filename)
          .replace(/\\/g, '/'),
        time: duration,
        size: document.size,
        course,
        section,
      });

      await this.videoRepository.save(record);

      await this.sectionService.updateTime(
        section.uuid,
        duration,
        Operations.ADD,
      );

      await this.sectionService.updateLecture(
        section.uuid,
        Operations.ADD
      );

      console.log(`✔ Saved video record: ${record.uuid}`);
    }
    console.log('🎉 All videos processed successfully!');
  }

  isVideo(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return VIDEO_EXTENSIONS.includes(ext);
  }
}
