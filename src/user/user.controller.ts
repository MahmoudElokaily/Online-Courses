import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { RoleGuard } from '../_cores/guards/role.guard';
import { AuthGuard } from '../_cores/guards/auth.guard';
import { CurrentUser } from '../_cores/decorators/current-user.decorator';
import type { IUserPayload } from '../_cores/types/express';
import { TransformDto } from '../_cores/interceptors/transform-interceptor';
import { UserResponseDto } from './dto/user.response.dto';
import { UserRolesEnum } from '../_cores/enums/user-roles.enum';
import { Roles } from '../_cores/decorators/role.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@UseGuards(AuthGuard, RoleGuard)
@TransformDto(UserResponseDto)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('my-profile')
  myProfile(@CurrentUser() currentUser: IUserPayload) {
    return this.userService.getMyProfile(currentUser);
  }

  @Get('')
  @Roles([UserRolesEnum.Admin])
  findAll(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursor') cursor: string,
  ) {
    return this.userService.findAll(limit, cursor);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('avatar'))
  update(
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
    ) avatar: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.userService.update(currentUser, updateUserDto , avatar);
  }

  @Delete(':uuid')
  @Roles([UserRolesEnum.Admin, UserRolesEnum.Student])
  remove(@Param('uuid') uuid: string) {
    return this.userService.remove(uuid);
  }

}
