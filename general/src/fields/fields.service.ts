import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Field } from './field.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from 'src/projects/project.entity';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';

@Injectable()
export class FieldsService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldsRepository: Repository<Field>
  ) {}

  async create(req: Request & { project: Project }, dto: CreateFieldDto) {
    const field = Object.assign(this.fieldsRepository.create(dto), {
      projectId: req.project.id,
    });
    return await this.fieldsRepository.save(field);
  }

  async getAll(projectId: number) {
    return await this.fieldsRepository.find({
      where: {
        projectId: projectId
      }}
    );
  }

  async getOne(id: number) {
    const field = await this.fieldsRepository.findOneBy({ id });
    if (!field) {
      throw new HttpException('Указанное поле не найдено', HttpStatus.BAD_REQUEST)
    } else {
      return field;
    }
  }

  async update(id: number, dto: UpdateFieldDto) {
    const field = await this.fieldsRepository.update(id, dto)
    if (!field.affected) {
      throw new HttpException('Указанное поле не было обновлено', HttpStatus.BAD_REQUEST)
    } else {
      return { message: `Поле с id [${id}] успешно обновлено` }
    }
  }

  async delete(id: number) {
    const field = await this.fieldsRepository.delete({ id });
    if (!field.affected) {
      throw new HttpException('Указанное поле не было удалено', HttpStatus.BAD_REQUEST)
    } else {
      return { message: `Поле с id [${id}] успешно удалено` }
    }
  }
}
