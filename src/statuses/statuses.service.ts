import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from './status.entity';
import { Repository } from 'typeorm';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { User } from 'src/users/user.entity';
import { Project } from 'src/projects/project.entity';
import { ProjectsService } from 'src/projects/projects.service';
import { ProjectStatusOrderDto } from './dto/project-status-order.dto';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>,
    private projectService: ProjectsService
  ) {}

  async create(req: Request & {user: User}, projectId: number, dto: CreateStatusDto) {
    const status = this.statusRepository.create(dto);
    let project: Project;
    for (let projectElem of req.user.projects) {
      if (projectElem.id === projectId) {
        project = projectElem;
        break
      }
    }
    project.statuses = [...project.statuses, status]
    return await this.projectService.saveWithOrdering(project)
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

  async delete(req: Request & {user: User}, projectId: number, statusId: number) {
    const project = this.findProjectInUser(req, projectId)
    project.statuses = project.statuses.filter((projectStatus) => projectStatus.id !== statusId)
    return await this.projectService.saveWithOrdering(project)
  }

  private findProjectInUser(req: Request & {user: User}, projectId: number) {
    let project: Project;
    for (let projectElem of req.user.projects) {
      if (projectElem.id === projectId) {
        project = projectElem;
        break
      }
    }
    return project;
  }

  async OrderAt(req: Request & {user: User}, projectId: number, statusId: number, dto: ProjectStatusOrderDto) {
    const project = this.findProjectInUser(req, projectId);
    const statusName = this.findStatusInProject(project, statusId).name;
    return await this.projectService.insertIntoOrderAt(project, statusName, dto);
  }

  private findStatusInProject(project: Project, statusId: number) {
    let status: Status;
    for (let statusElem of project.statuses) {
      if (statusElem.id === statusId) {
        status = statusElem;
        break
      }
    }
    return status;
  }
}
