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
import { UpdateSectionDto } from './dto/update-section.dto';
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

  @Get()
  findAll() {
    return this.sectionService.findAll();
  }

  @Get(':uuid')
  findOne(@Param('uuid' , ParseUUIDPipe) uuid: string) {
    return this.sectionService.findOne(uuid);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionService.update(+id, updateSectionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectionService.remove(+id);
  }
}
