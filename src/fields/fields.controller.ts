import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards, UsePipes } from '@nestjs/common';
import { Field } from './field.entity';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateFieldDto } from './dto/create-field.dto';
import { JWTAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { OwnerGuard } from 'src/guards/owner.guard';
import { Project } from 'src/projects/project.entity';
import { FieldsService } from './fields.service';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { UpdateFieldDto } from './dto/update-field.dto';

@Controller('api/:projectId/fields')
export class FieldsController {
  constructor(private readonly fieldsService: FieldsService) {}

  @ApiOperation({ summary: 'Создать поле проекта' })
  @ApiResponse({ status: 201, type: Field })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Post()
  create(
    @Req() req: Request & { project: Project },
    @Body() dto: CreateFieldDto
  ) {
    return this.fieldsService.create(req, dto);
  }

  @ApiOperation({ summary: 'Получить все поля проекта' })
  @ApiResponse({ status: 200, type: [Field] })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get()
  getAll(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.fieldsService.getAll(projectId);
  }

  @ApiOperation({ summary: 'Получить поле проекта' })
  @ApiResponse({ status: 200, type: Field })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get(':fieldId')
  getOne(
    @Param('fieldId', ParseIntPipe) fieldId: number,
  ) {
    return this.fieldsService.getOne(fieldId);
  }

  @ApiOperation({ summary: 'Изменить поле проекта' })
  @ApiResponse({ status: 200, description: 'Поле с id [1] успешно обновлено' })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Put(':fieldId')
  update(
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() dto: UpdateFieldDto
  ) {
    return this.fieldsService.update(fieldId, dto);
  }

  @ApiOperation({ summary: 'Удалить поле проекта' })
  @ApiResponse({ status: 200, description: `Поле с id [1] успешно удалено` })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Delete(':fieldId')
  delete(
    @Param('fieldId', ParseIntPipe) fieldId: number
  ) {
    return this.fieldsService.delete(fieldId);
  }
}
