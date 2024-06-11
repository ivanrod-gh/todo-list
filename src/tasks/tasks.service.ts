import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Task } from './task.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { Status } from 'src/statuses/status.entity';
import { StatusesService } from 'src/statuses/statuses.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { StatusTaskOrderDto } from './dto/status-task-order.dto';
import { Project } from 'src/projects/project.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly statusService: StatusesService
  ) {}

  async create(req: Request & { status: Status }, dto: CreateTaskDto) {
    const task = this.tasksRepository.create(dto);
    task.projectId = req.status.projectId;
    req.status.tasks = [...req.status.tasks, task];
    return await this.statusService.saveWithOrdering(req.status);
  }

  async getAll(statusId: number) {
    return await this.tasksRepository.find({
      where: {
        statusId: statusId
      }}
    );
  }

  async getOne(id: number) {
    const task = await this.tasksRepository.findOneBy({ id });
    if (!task) {
      throw new HttpException('Указанная задача не найдена', HttpStatus.BAD_REQUEST)
    } else {
      return task;
    }
  }

  async update(id: number, dto: UpdateTaskDto) {
    const task = await this.tasksRepository.update(id, dto)
    if (!task.affected) {
      throw new HttpException('Указанный статус не был обновлен', HttpStatus.BAD_REQUEST)
    } else {
      return { message: `Задача с id [${id}] успешно обновлена` }
    }
  }

  async delete(req: Request & { status: Status }, taskId: number) {
    req.status.tasks = req.status.tasks.filter((task) => task.id !== taskId)
    return await this.statusService.saveWithOrdering(req.status)
  }

  async OrderAt(req: Request & { status: Status, task: Task }, dto: StatusTaskOrderDto) {
    return await this.statusService.insertIntoOrderAt(req.status, req.task.name, dto.orderAt);
  }

  async MoveOrderAt(req: Request & {
    project: Project,
    status: Status,
    secondStatus: Status,
    task: Task
    }, dto: StatusTaskOrderDto) {
    return await this.statusService.moveInsertIntoOrderAt(req.project, req.status, req.secondStatus, req.task, dto.orderAt);
  }
}
