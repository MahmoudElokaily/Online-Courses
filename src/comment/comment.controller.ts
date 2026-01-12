import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { TransformDto } from '../_cores/interceptors/transform-interceptor';
import { CommentResponseDto } from './dto/comment-response.dto';
import { AuthGuard } from '../_cores/guards/auth.guard';
import { RoleGuard } from '../_cores/guards/role.guard';
import { CurrentUser } from '../_cores/decorators/current-user.decorator';
import type { IUserPayload } from '../_cores/types/express';
import { Roles } from '../_cores/decorators/role.decorator';
import { UserRolesEnum } from '../_cores/enums/user-roles.enum';

@TransformDto(CommentResponseDto)
@Controller('comments')
@UseGuards(AuthGuard, RoleGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/:uuid')
  create(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() createCommentDto: CreateCommentDto,
    @CurrentUser() currentUser: IUserPayload,
  ) {
    return this.commentService.create(uuid, createCommentDto, currentUser);
  }

  @Get()
  findAll() {
    return this.commentService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.commentService.findCommentByUuid(uuid);
  }

  @Roles([UserRolesEnum.Admin, UserRolesEnum.Instructor, UserRolesEnum.Student])
  @Patch(':uuid')
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    return this.commentService.update(uuid, updateCommentDto);
  }

  @Roles([UserRolesEnum.Admin, UserRolesEnum.Instructor, UserRolesEnum.Student])
  @Delete(':uuid')
  remove(@Param('uuid') uuid: string) {
    return this.commentService.remove(uuid);
  }
}
