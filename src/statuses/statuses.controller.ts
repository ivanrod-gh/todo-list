import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards, UsePipes } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Status } from './status.entity';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { OwnerGuard } from 'src/guards/owner.guard';
import { JWTAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller('api/:projectId/statuses')
export class StatusesController {

  constructor(private readonly statusService: StatusesService) {}

  @ApiOperation({summary: 'Создать статус (группу для задач) проекта'})
  @ApiResponse({status: 200, type: Status})
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(JWTAuthGuard)
  @Post()
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateStatusDto
  ) {
    return this.statusService.create(projectId, dto);
  }

  @ApiOperation({summary: 'Получить все статусы проекта'})
  @ApiResponse({status: 200, type: [Status]})
  @UseGuards(OwnerGuard)
  @UseGuards(JWTAuthGuard)
  @Get()
  getAll(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.statusService.getAll(projectId);
  }

  @ApiOperation({summary: 'Получить статус проекта'})
  @ApiResponse({status: 200, type: Status})
  @UseGuards(OwnerGuard)
  @UseGuards(JWTAuthGuard)
  @Get(':statusId')
  getOne(
    @Param('statusId', ParseIntPipe) statusId: number,
  ) {
    return this.statusService.getOne(statusId);
  }

  @ApiOperation({summary: 'Удалить проект пользователя'})
  @ApiResponse({status: 200, type: Status})
  @UseGuards(OwnerGuard)
  @UseGuards(JWTAuthGuard)
  @Delete(':statusId')
  delete(
    @Param('statusId', ParseIntPipe) statusId: number,
  ) {
    return this.statusService.delete(statusId);
  }

  @ApiOperation({summary: 'Изменить проект пользователя'})
  @ApiResponse({status: 200, type: Status})
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(JWTAuthGuard)
  @Put(':statusId')
  update(
    @Param('statusId', ParseIntPipe) statusId: number,
    @Body() dto: UpdateStatusDto
  ) {
    return this.statusService.update(statusId, dto);
  }
}
