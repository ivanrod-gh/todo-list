import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Status } from './status.entity';
import { Repository } from 'typeorm';
import { CreateStatusDto } from './dto/create-status.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Injectable()
export class StatusesService {
  constructor(
    @InjectRepository(Status)
    private readonly statusRepository: Repository<Status>
  ) {}

  async create(projectId: number, dto: CreateStatusDto) {
    const status = this.statusRepository.create(dto);
    status.projectId = projectId;
    return await this.statusRepository.save(status);
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
      throw new HttpException('Указанный проект не найден', HttpStatus.BAD_REQUEST)
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

  async delete(id: number) {
    const status = await this.statusRepository.delete({ id });
    if (!status.affected) {
      throw new HttpException('Указанный статус не был удален', HttpStatus.BAD_REQUEST)
    } else {
      return { message: `Статус с id [${id}] успешно удален` }
    }
  }
}
