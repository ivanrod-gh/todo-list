import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards, UsePipes } from '@nestjs/common';
import { StatusesService } from './statuses.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Status } from './status.entity';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { OwnerGuard } from 'src/guards/owner.guard';
import { JWTAuthGuard } from 'src/guards/jwt-auth.guard';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Project } from 'src/projects/project.entity';
import { ProjectStatusOrderDto } from './dto/project-status-order.dto';
import { Roles } from 'src/decorators/roles-auth.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@ApiTags('Статусы')
@Roles('ADMIN', 'USER')
@Controller('api/:projectId/statuses')
export class StatusesController {

  constructor(private readonly statusService: StatusesService) {}

  @ApiOperation({ summary: 'Создать статус (группу для задач) проекта' })
  @ApiResponse({ status: 201, type: Project })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Post()
  create(
    @Req() req: Request & { project: Project },
    @Body() dto: CreateStatusDto
  ) {
    return this.statusService.create(req, dto);
  }

  @ApiOperation({ summary: 'Получить все статусы проекта' })
  @ApiResponse({ status: 200, type: [Status] })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get()
  getAll(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.statusService.getAll(projectId);
  }

  @ApiOperation({ summary: 'Получить статус проекта' })
  @ApiResponse({ status: 200, type: Status })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get(':statusId')
  getOne(
    @Param('statusId', ParseIntPipe) statusId: number,
  ) {
    return this.statusService.getOne(statusId);
  }

  @ApiOperation({ summary: 'Изменить статус проекта' })
  @ApiResponse({ status: 200, description: 'Статус с id [1] успешно обновлен' })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Put(':statusId')
  update(
    @Param('statusId', ParseIntPipe) statusId: number,
    @Body() dto: UpdateStatusDto
  ) {
    return this.statusService.update(statusId, dto);
  }

  @ApiOperation({ summary: 'Удалить статус проекта' })
  @ApiResponse({ status: 200, type: Project })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Delete(':statusId')
  delete(
    @Req() req: Request & { project: Project },
    @Param('statusId', ParseIntPipe) statusId: number,
  ) {
    return this.statusService.delete(req, statusId);
  }

  @ApiOperation({ summary: 'Поставить на конкретное место по индексу в очередности статусов проекта' })
  @ApiResponse({ status: 200, type: Project })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Put(':statusId/order-at')
  OrderAt(
    @Req() req: Request & { project: Project, status: Status },
    @Body() dto: ProjectStatusOrderDto
  ) {
    return this.statusService.OrderAt(req, dto);
  }
}
