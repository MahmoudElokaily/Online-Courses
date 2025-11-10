import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Patch,
  Post,
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

@Controller('courses')
@UseGuards(AuthGuard, RoleGuard)
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
  findAll() {
    return this.courseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.courseService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    return this.courseService.update(+id, updateCourseDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.courseService.remove(+id);
  }
}
