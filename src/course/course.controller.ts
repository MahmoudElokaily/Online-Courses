import {
  Body,
  Controller, DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder, ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post, Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { RoleGuard } from '../_cores/guards/role.guard';
import { AuthGuard } from '../_cores/guards/auth.guard';
import { Roles } from '../_cores/decorators/role.decorator';
import { UserRolesEnum } from '../_cores/enums/user-roles.enum';
import { CurrentUser } from '../_cores/decorators/current-user.decorator';
import type { IUserPayload } from '../_cores/types/express';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransformDto } from '../_cores/interceptors/transform-interceptor';
import { CourseResponseDto } from './dto/course-response.dto';

@Controller('courses')
@UseGuards(AuthGuard, RoleGuard)
@TransformDto(CourseResponseDto)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @Roles([UserRolesEnum.Instructor, UserRolesEnum.Admin])
  @UseInterceptors(FileInterceptor('cover'))
  create(
    @CurrentUser() currentUser: IUserPayload,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 2 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        })
    ) cover: Express.Multer.File,
    @Body() createCourseDto: CreateCourseDto,
  ) {
    return this.courseService.create(createCourseDto, currentUser, cover);
  }

  @Get()
  findAll(
    @Query('limit' , new DefaultValuePipe(10) , ParseIntPipe) limit: number,
    @Query('cursor') cursor: string,
    @Query('search'  ) search: string,
  ) {
    return this.courseService.findAll(limit , cursor , search);
  }

  @Get(':uuid')
  findOne(@Param('uuid' , ParseUUIDPipe) uuid: string) {
    return this.courseService.findOneUsingUuid(uuid);
  }

  @Patch(':uuid')
  @UseInterceptors(FileInterceptor('cover'))
  update(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/i,
        })
        .addMaxSizeValidator({
          maxSize: 2 * 1024 * 1024,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        })
    ) cover: Express.Multer.File,
    @Param('uuid' , ParseUUIDPipe) uuid: string,
    @Body() updateCourseDto: UpdateCourseDto
  ) {
    return this.courseService.update(uuid, updateCourseDto , cover);
  }

  @Roles([UserRolesEnum.Admin, UserRolesEnum.Instructor])
  @Delete(':uuid')
  remove(@Param('uuid' , ParseUUIDPipe) id: string) {
    return this.courseService.remove(id);
  }
}
