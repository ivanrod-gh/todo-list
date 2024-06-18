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
import { ValuesService } from 'src/values/values.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly statusService: StatusesService,
    private readonly valuesService: ValuesService
  ) {}

  async create(req: Request & { status: Status }, dto: CreateTaskDto) {
    const task = Object.assign(this.tasksRepository.create(dto), {
      statusId: req.status.id,
      projectId: req.status.projectId,
      stringValues: [],
      realValues: [],
      arrayElemValues: []
    })

    if (dto.stringValuesData) {
      for (let stringValueData of dto.stringValuesData) {
        const buildedStringValue = this.valuesService.buildStringValue(stringValueData);
        task.stringValues = [...task.stringValues, buildedStringValue];
      }
    }
    if (dto.realValuesData) {
      for (let realValueData of dto.realValuesData) {
        const buildedRealValue = this.valuesService.buildRealValue(realValueData);
        task.realValues = [...task.realValues, buildedRealValue];
      }
    }
    if (dto.arrayElemValuesData) {
      for (let arrayElemValueData of dto.arrayElemValuesData) {
        const buildedArrayElemValue = this.valuesService.buildArrayElemValue(arrayElemValueData);
        task.arrayElemValues = [...task.arrayElemValues, buildedArrayElemValue];
      }
    }

    const savedTask = await this.tasksRepository.save(task);
    req.status.tasks = [...req.status.tasks, savedTask];
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

  async update(req: Request & { task: Task }, dto: UpdateTaskDto) {
    const task = Object.assign(req.task, dto);

    if (dto.stringValuesData) {
      const valuesData = dto.stringValuesData;
      const valuesType: string = "stringValues";
      task[valuesType] = this.manageFieldValues(task[valuesType], valuesData, valuesType);
    }
    if (dto.realValuesData) {
      const valuesData = dto.realValuesData;
      const valuesType: string = "realValues";
      task[valuesType] = this.manageFieldValues(task[valuesType], valuesData, valuesType);
    }
    if (dto.arrayElemValuesData) {
      const valuesData = dto.arrayElemValuesData;
      const valuesType: string = "arrayElemValues";
      task[valuesType] = this.manageFieldValues(task[valuesType], valuesData, valuesType);
    }

    return await this.tasksRepository.save(task);
  }

  private manageFieldValues(taskValues, valuesData, valuesType: string) {
    for (let valueData of valuesData) {
      let valueManaged: boolean;
      for (let taskValue of taskValues) {
        if (taskValue.fieldId === valueData.fieldId) {
          valueManaged = true;
          if (valueData.destroy) {
            taskValues = taskValues.filter(value => value.fieldId != valueData.fieldId);
          } else {
            taskValue.value = valueData.value;
          }
        }
      }
      if (!valueManaged && !valueData.destroy) {
        let buildedValue;
        if (valuesType === "stringValues") {
          buildedValue = this.valuesService.buildStringValue(valueData);
        } else if (valuesType === "realValues"){
          buildedValue = this.valuesService.buildRealValue(valueData);
        } else if (valuesType === "arrayElemValues"){
          buildedValue = this.valuesService.buildArrayElemValue(valueData);
        }
        taskValues = [...taskValues, buildedValue];
      }
    }
    return taskValues;
  }

  async delete(req: Request & { status: Status }, taskId: number) {
    req.status.tasks = req.status.tasks.filter((task) => task.id !== taskId)
    return await this.statusService.saveWithOrdering(req.status)
  }

  async OrderAt(req: Request & { status: Status, task: Task }, dto: StatusTaskOrderDto) {
    return await this.statusService.insertIntoOrderAt(req.status, req.task.id.toString(), dto.orderAt);
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
