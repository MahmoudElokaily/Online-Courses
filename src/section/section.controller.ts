import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { SectionService } from './section.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { RoleGuard } from '../_cores/guards/role.guard';
import { AuthGuard } from '../_cores/guards/auth.guard';
import { UserRolesEnum } from '../_cores/enums/user-roles.enum';
import { Roles } from '../_cores/decorators/role.decorator';
import { TransformDto } from '../_cores/interceptors/transform-interceptor';
import { SectionResponseDto } from './dto/section-response.dto';

@Controller('sections')
@TransformDto(SectionResponseDto)
@UseGuards(AuthGuard , RoleGuard)
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post('/:uuid')
  @Roles([UserRolesEnum.Admin , UserRolesEnum.Instructor])
  create(@Param('uuid' , ParseUUIDPipe) uuid: string , @Body() createSectionDto: CreateSectionDto) {
    return this.sectionService.create(uuid , createSectionDto);
  }

  @Get('course/:uuid')
  findAll(@Param('uuid' , ParseUUIDPipe) uuid: string) {
    return this.sectionService.findAll(uuid);
  }

  @Get(':uuid')
  findOne(@Param('uuid' , ParseUUIDPipe) uuid: string) {
    return this.sectionService.findOne(uuid);
  }

  @Patch(':uuid')
  @Roles([UserRolesEnum.Admin , UserRolesEnum.Instructor])
  update(@Param('uuid') uuid: string, @Body() updateSectionDto: CreateSectionDto) {
    return this.sectionService.update(uuid, updateSectionDto);
  }

  @Delete(':id')
  @Roles([UserRolesEnum.Admin , UserRolesEnum.Instructor])
  remove(@Param('uuid') uuid: string) {
    return this.sectionService.remove(uuid);
  }
}
