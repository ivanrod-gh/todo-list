import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from './status.entity';
import { Repository } from 'typeorm';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { Project } from 'src/projects/project.entity';
import { ProjectsService } from 'src/projects/projects.service';
import { ProjectStatusOrderDto } from './dto/project-status-order.dto';
import { Task } from 'src/tasks/task.entity';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    private readonly projectService: ProjectsService
  ) {}

  async create(req: Request & {project: Project}, dto: CreateStatusDto) {
    const status = Object.assign(this.statusRepository.create(dto), {
      projectId: req.project.id,
      tasks: [],
    });
    const savedStatus = await this.statusRepository.save(status);
    req.project.statuses = [...req.project.statuses, savedStatus];
    return await this.projectService.saveWithOrdering(req.project)
  }

  async getAll(projectId: number) {
    return await this.statusRepository.find({
      where: {
        projectId: projectId
      }}
    );
  }

  async getOne(id: number) {
    const status = await this.statusRepository.findOneBy({ id });
    if (!status) {
      throw new HttpException('Указанный статус не найден', HttpStatus.BAD_REQUEST)
    } else {
      return status;
    }
  }

  async update(id: number, dto: UpdateStatusDto) {
    const status = await this.statusRepository.update(id, dto)
    if (!status.affected) {
      throw new HttpException('Указанный статус не был обновлен', HttpStatus.BAD_REQUEST)
    } else {
      return { message: `Статус с id [${id}] успешно обновлен` }
    }
  }

  async delete(req: Request & { project: Project }, statusId: number) {
    req.project.statuses = req.project.statuses.filter((status) => status.id !== statusId)
    return await this.projectService.saveWithOrdering(req.project)
  }

  async OrderAt(req: Request & { project: Project, status: Status }, dto: ProjectStatusOrderDto) {
    return await this.projectService.insertIntoOrderAt(req.project, req.status.id.toString(), dto.orderAt);
  }

  async saveWithOrdering(status : Status) {
    status.order = this.manageOrder(status)
    return await this.statusRepository.save(status);
  }

  manageOrder(status : Status) {
    let statusOrder = status.order;
    const tasksIds = status.tasks.map((task) => task.id.toString());
    if (statusOrder.length < tasksIds.length) {
      const arrayDiff = tasksIds.filter(taskId => !statusOrder.includes(taskId))
      statusOrder = statusOrder.concat(arrayDiff)
    } else {
      statusOrder = statusOrder.filter(taskId => tasksIds.includes(taskId))
    }
    return statusOrder;
  }

  async insertIntoOrderAt(status : Status, taskId: string, insertAt: number) {
    status.order = this.manageInsertingInOrder(status, taskId, insertAt, true);
    return await this.statusRepository.save(status);
  }

  manageInsertingInOrder(status : Status, taskId: string, insertAt: number, withDeletionInOrder: true | false) {
    let statusOrder = status.order;
    if (
      insertAt < 0 ||
      (withDeletionInOrder && insertAt > statusOrder.length - 1) ||
      (!withDeletionInOrder && insertAt > statusOrder.length)
    ) {
      throw new HttpException('Указан неверный индекс очередности', HttpStatus.BAD_REQUEST)
    }
    if (withDeletionInOrder) {
      const statusIndex = statusOrder.indexOf(taskId);
      statusOrder.splice(statusIndex, 1);
    }
    statusOrder.splice(insertAt, 0, taskId);
    return statusOrder;
  }

  async moveInsertIntoOrderAt(project: Project, status: Status, secondStatus: Status, task: Task, insertAt: number) {
    secondStatus.order = this.manageInsertingInOrder(secondStatus, task.id.toString(), insertAt, false);
    secondStatus.tasks = [...secondStatus.tasks, task]

    status.tasks = status.tasks.filter(statusTask => statusTask.id !== task.id)
    status.order = this.manageOrder(status)

    await this.statusRepository.save(secondStatus);
    await this.statusRepository.save(status);
    return project;
  }
}


