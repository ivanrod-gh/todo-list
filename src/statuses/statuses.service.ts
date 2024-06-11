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
    const status = this.statusRepository.create(dto);
    req.project.statuses = [...req.project.statuses, status]
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
    return await this.projectService.insertIntoOrderAt(req.project, req.status.name, dto.orderAt);
  }

  async saveWithOrdering(status : Status) {
    status.order = this.manageOrder(status)
    return await this.statusRepository.save(status);
  }

  manageOrder(status : Status) {
    let statusOrder = status.order;
    const tasksNames = status.tasks.map((task) => task.name);
    if (statusOrder.length < tasksNames.length) {
      const arrayDiff = tasksNames.filter(taskName => !statusOrder.includes(taskName))
      statusOrder = statusOrder.concat(arrayDiff)
    } else {
      statusOrder = statusOrder.filter(taskName => tasksNames.includes(taskName))
    }
    return statusOrder;
  }

  async insertIntoOrderAt(status : Status, taskName: string, insertAt: number) {
    status.order = this.manageInsertingInOrder(status, taskName, insertAt, true);
    return await this.statusRepository.save(status);
  }

  manageInsertingInOrder(status : Status, taskName: string, insertAt: number, preliminaryDestroy: true | false) {
    let statusOrder = status.order;
    if (
      insertAt < 0 ||
      (preliminaryDestroy && insertAt > statusOrder.length - 1) ||
      (!preliminaryDestroy && insertAt > statusOrder.length)
    ) {
      throw new HttpException('Указан неверный индекс очередности', HttpStatus.BAD_REQUEST)
    }
    if (preliminaryDestroy) {
      const statusIndex = statusOrder.indexOf(taskName);
      statusOrder.splice(statusIndex, 1);
    }
    statusOrder.splice(insertAt, 0, taskName);
    return statusOrder;
  }

  async moveInsertIntoOrderAt(project: Project, status: Status, secondStatus: Status, task: Task, insertAt: number) {
    secondStatus.order = this.manageInsertingInOrder(secondStatus, task.name, insertAt, false);
    secondStatus.tasks = [...secondStatus.tasks, task]

    status.tasks = status.tasks.filter(statusTask => statusTask.id !== task.id)
    status.order = this.manageOrder(status)

    await this.statusRepository.save(secondStatus);
    await this.statusRepository.save(status);
    return project;
  }
}


