import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Repository } from 'typeorm';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>
  ) {}

  async create(userId: number, dto: CreateProjectDto) {
    const project = this.projectRepository.create(dto);
    project.userId = userId;
    return await this.projectRepository.save(project);
  }

  async getAll(userId: number) {
    return await this.projectRepository.find({
      where: {
        userId: userId
      }}
    );
  }

  async getOne(id: number) {
    const project = await this.projectRepository.findOneBy({ id });
    if (!project) {
      throw new HttpException('Указанный проект не найден', HttpStatus.BAD_REQUEST)
    } else {
      return project;
    }
  }

  async update(id: number, dto: UpdateProjectDto) {
    const project = await this.projectRepository.update(id, dto)
    if (!project.affected) {
      throw new HttpException('Указанный проект не был обновлен', HttpStatus.BAD_REQUEST)
    } else {
      return { message: `Проект с id [${id}] успешно обновлен` }
    }
  }

  async delete(id: number) {
    const project = await this.projectRepository.delete({ id });
    if (!project.affected) {
      throw new HttpException('Указанный проект не был удален', HttpStatus.BAD_REQUEST)
    } else {
      return { message: `Проект с id [${id}] успешно удален` }
    }
  }

  async saveWithOrdering(project : Project) {
    project.order = await this.manageOrder(project)
    return await this.projectRepository.save(project);
  }

  async manageOrder(project : Project) {
    let projectOrder = project.order;
    const statusesNames = project.statuses.map((status) => status.name);
    if (projectOrder.length < statusesNames.length) {
      const arrayDiff = statusesNames.filter(statusName => !projectOrder.includes(statusName))
      projectOrder = projectOrder.concat(arrayDiff)
    } else {
      projectOrder = projectOrder.filter(statusName => statusesNames.includes(statusName))
    }
    return projectOrder;
  }

  async insertIntoOrderAt(project : Project, statusName: string, insertAt: number) {
    project.order = this.manageInsertingInOrder(project, statusName, insertAt);
    return await this.projectRepository.save(project);
  }

  manageInsertingInOrder(project : Project, statusName: string, insertAt: number) {
    let projectOrder = project.order;
    if (insertAt < 0 || insertAt > projectOrder.length - 1) {
      throw new HttpException('Указан неверный индекс очередности', HttpStatus.BAD_REQUEST);
    }
    const statusIndex = projectOrder.indexOf(statusName);
    projectOrder.splice(statusIndex, 1);
    projectOrder.splice(insertAt, 0, statusName);
    return projectOrder;
  }
}
