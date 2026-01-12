import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Delete,
  Param,
  ParseUUIDPipe,
  UseGuards, Get,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { RoleGuard } from '../_cores/guards/role.guard';
import { AuthGuard } from '../_cores/guards/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import fs from 'node:fs';
import path from 'node:path';
import { Roles } from '../_cores/decorators/role.decorator';
import { UserRolesEnum } from '../_cores/enums/user-roles.enum';

const TMP_UPLOAD_DIR = path.join(process.cwd(), 'tmp', 'uploads');

@Controller('videos')
@UseGuards(AuthGuard, RoleGuard)
export class VideoController {
  constructor(private readonly videoService: VideoService) {}
  @Post(':uuid')
  @Roles([UserRolesEnum.Admin, UserRolesEnum.Instructor])
  @UseInterceptors(
    FilesInterceptor('documents', 50, {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          if (!fs.existsSync(TMP_UPLOAD_DIR)) {
            fs.mkdirSync(TMP_UPLOAD_DIR, { recursive: true });
          }
          cb(null, TMP_UPLOAD_DIR);
        },
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 1024 * 1024 * 1024, // 1GB per file
        files: 50,
      },
    }),
  )
  upload(
    @Body() createVideoDto: CreateVideoDto,
    @UploadedFiles() documents: Express.Multer.File[],
    @Param('uuid', ParseUUIDPipe) uuid: string,
  ) {
    return this.videoService.uploadVideos(uuid, createVideoDto, documents);
  }

  @Delete(':uuid')
  @Roles([UserRolesEnum.Admin, UserRolesEnum.Instructor])
  deleteVideo(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.videoService.deleteVideo(uuid);
  }

  @Get(':uuid')
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.videoService.findVideoByUuid(uuid);
  }
}
