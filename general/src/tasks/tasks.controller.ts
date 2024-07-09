import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards, UsePipes } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { OwnerGuard } from 'src/guards/owner.guard';
import { JWTAuthGuard } from 'src/guards/jwt-auth.guard';
import { Task } from './task.entity';
import { Status } from 'src/statuses/status.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { StatusTaskOrderDto } from './dto/status-task-order.dto';
import { Project } from 'src/projects/project.entity';
import { Roles } from 'src/decorators/roles-auth.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@ApiTags('Задачи')
@Roles('ADMIN', 'USER')
@Controller('api/:statusId/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @ApiOperation({ summary: 'Создать задачу статуса' })
  @ApiResponse({ status: 201, type: Status })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Post()
  create(
    @Req() req: Request & { status: Status },
    @Body() dto: CreateTaskDto
  ) {
    return this.tasksService.create(req, dto);
  }

  @ApiOperation({ summary: 'Получить все задачи статуса' })
  @ApiResponse({ status: 200, type: [Status] })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get()
  getAll(@Param('statusId', ParseIntPipe) statusId: number) {
    return this.tasksService.getAll(statusId);
  }

  @ApiOperation({ summary: 'Получить задачу статуса проекта' })
  @ApiResponse({ status: 200, type: Task })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get(':taskId')
  getOne(
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.tasksService.getOne(taskId);
  }

  @ApiOperation({ summary: 'Изменить задачу статуса' })
  @ApiResponse({ status: 200, description: 'Задача с id [1] успешно обновлена' })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Put(':taskId')
  update(
    @Req() req: Request & { task: Task },
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() dto: UpdateTaskDto
  ) {
    return this.tasksService.update(req, dto);
  }

  @ApiOperation({ summary: 'Удалить задачу статуса' })
  @ApiResponse({ status: 200, type: Status })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Delete(':taskId')
  delete(
    @Req() req: Request & { status: Status },
    @Param('taskId', ParseIntPipe) taskId: number,
  ) {
    return this.tasksService.delete(req, taskId);
  }

  @ApiOperation({ summary: 'Поставить на конкретное место по индексу в очередности задач статуса' })
  @ApiResponse({ status: 200, type: Status })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Put(':taskId/order-at')
  OrderAt(
    @Req() req: Request & { status: Status, task: Task },
    @Body() dto: StatusTaskOrderDto
  ) {
    return this.tasksService.OrderAt(req, dto);
  }

  @ApiOperation({ summary: 'Переместить в другой статус и поставить на конкретное место по индексу в очередности задач статуса' })
  @ApiResponse({ status: 200, type: Project })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Put(':taskId/move-order-at/:secondStatusId')
  MoveOrderAt(
    @Req() req: Request & { project: Project, status: Status, secondStatus: Status, task: Task },
    @Body() dto: StatusTaskOrderDto
  ) {
    return this.tasksService.MoveOrderAt(req, dto);
  }
}
