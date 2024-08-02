import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { Task } from './task.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { Status } from 'src/statuses/status.entity';
import { StatusesService } from 'src/statuses/statuses.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { StatusTaskOrderDto } from './dto/status-task-order.dto';
import { Project } from 'src/projects/project.entity';
import { ClientProxy } from '@nestjs/microservices';
import { TimeoutError, catchError, firstValueFrom, throwError, timeout } from 'rxjs';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    @Inject(forwardRef(() => StatusesService))
    private readonly statusService: StatusesService,
    @InjectEntityManager()
    private readonly taskManager: EntityManager,
    @Inject('GO_CLIENT') private goClient: ClientProxy,
  ) {}

  async create(req: Request & { status: Status }, dto: CreateTaskDto) {
    const task = Object.assign(this.tasksRepository.create(dto), {
      statusId: req.status.id,
      projectId: req.status.projectId,
      stringValues: [],
      realValues: [],
      arrayElemValues: [],
    })

    let data = this.generateValuesRequestData(dto);
    let response = await this.microRequest({ cmd: 'validateTaskData' }, data);
    
    const savedTask = await this.tasksRepository.save(task);
    req.status.tasks = [...req.status.tasks, savedTask];

    this.valuesRequestDataWithTaskId(data, savedTask.id)
    response = await this.microRequest({ cmd: 'createUpdateDelete' }, data);
    this.fieldValuesToTask(task, response.data)

    return await this.statusService.updateOrder(req.status);
  }

  async getAll(statusId: number) {
    const tasks = await this.tasksRepository.find({
      where: {
        statusId: statusId
      }}
    );

    if (tasks?.length) {
      const taskIds = [];
      for (let i = 0; i < tasks.length; i++) {
        taskIds.push(tasks[i].id);
        tasks[i] = Object.assign(tasks[i], {
          stringValues: [],
          realValues: [],
          arrayElemValues: [],
        })
      }
      let data = {
        taskIds: taskIds
      }
      let response = await this.microRequest({ cmd: 'find' }, data);

      this.findedFieldValuesToTasks(tasks, response)
    }

    return tasks;
  }

  async getOne(id: number) {
    const tasks = await this.tasksRepository.findBy({ id });
    if (tasks?.length) {

      const task = Object.assign(tasks[0], {
        stringValues: [],
        realValues: [],
        arrayElemValues: [],
      })
      
      let data = {
        taskIds: [id],
      }
      let response = await this.microRequest({ cmd: 'find' }, data);

      this.findedFieldValuesToTasks([task], response)

      return task;
    } else {
      throw new HttpException('Указанная задача не найдена', HttpStatus.BAD_REQUEST)
    }
  }

  async update(req: Request & { task: Task }, dto: UpdateTaskDto) {
    const task = Object.assign(req.task, {
      stringValues: [],
      realValues: [],
      arrayElemValues: [],
    });

    let data = this.generateValuesRequestData(dto);
    let response = await this.microRequest({ cmd: 'validateTaskData' }, data);
    this.valuesRequestDataWithTaskId(data, req.task.id)
    response = await this.microRequest({ cmd: 'createUpdateDelete' }, data);
    this.fieldValuesToTask(task, response.data);

    return await this.tasksRepository.save(task);
  }

  async delete(req: Request & { status: Status }, id: number) {
    let data = {
      taskIds: [id],
    }
    await this.microRequest({ cmd: 'cascadeDelete' }, data);

    const task = await this.tasksRepository.delete(id);
    if (!task.affected) {
      throw new HttpException('Указанная задача не была удалена', HttpStatus.BAD_REQUEST);
    }

    req.status.tasks = req.status.tasks.filter((task) => task.id !== id);
    return await this.statusService.updateOrder(req.status);
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

  async updateStatusId(task: Task, status: Status) {
    await this.tasksRepository.update(task.id, { statusId: status.id });
  }

  private generateValuesRequestData(dto: CreateTaskDto | UpdateTaskDto) {
    let data = {
      realValuesData: [],
      stringValuesData: [],
      arrayElemValuesData: [],
    }
    if (dto.realValuesData) {
      for (let realValueData of dto.realValuesData) {
        data.realValuesData = [...data.realValuesData, realValueData];
      }
    }
    if (dto.stringValuesData) {
      for (let stringValueData of dto.stringValuesData) {
        data.stringValuesData = [...data.stringValuesData, stringValueData];
      }
    }
    if (dto.arrayElemValuesData) {
      for (let arrayElemValueData of dto.arrayElemValuesData) {
        data.arrayElemValuesData = [...data.arrayElemValuesData, arrayElemValueData];
      }
    }

    return data;
  }

  private valuesRequestDataWithTaskId(data, taskId: number) {
    if (data.realValuesData) {
      for (let realValueData of data.realValuesData) {
        realValueData.taskId = taskId;
      }
    }
    if (data.stringValuesData) {
      for (let stringValueData of data.stringValuesData) {
        stringValueData.taskId = taskId;
      }
    }
    if (data.arrayElemValuesData) {
      for (let arrayElemValueData of data.arrayElemValuesData) {
        arrayElemValueData.taskId = taskId;
      }
    }
  }

  private fieldValuesToTask(task, data) {
    if (data?.realValuesData) {
      for (let realValueData of data.realValuesData) {
        task.realValues = [...task.realValues, realValueData];
      }
    }
    if (data?.stringValuesData) {
      for (let stringValueData of data.stringValuesData) {
        task.stringValues = [...task.stringValues, stringValueData];
      }
    }
    if (data?.arrayElemValuesData) {
      for (let arrayElemValueData of data.arrayElemValuesData) {
        task.arrayElemValues = [...task.arrayElemValues, arrayElemValueData];
      }
    }
  }
  private findedFieldValuesToTasks(tasks, response) {
    if (tasks?.length) {
      for (let i = 0; i < tasks.length; i++) {
        if (response?.data[tasks[i].id]) {
          if (response?.data[tasks[i].id]?.realValuesData) {
            tasks[i].realValues = response.data[tasks[i].id].realValuesData
          }
          if (response?.data[tasks[i].id]?.stringValuesData) {
            tasks[i].stringValues = response.data[tasks[i].id].stringValuesData
          }
          if (response?.data[tasks[i].id]?.arrayElemValuesData) {
            tasks[i].arrayElemValues = response.data[tasks[i].id].arrayElemValuesData
          }
        }
      }
    }
  }

  private async microRequest(pattern: {}, data) {
    let response = await firstValueFrom(this
      .goClient
      .send(pattern, data)
      .pipe(timeout(5000), catchError(err => this.handleMicroserviceError(err)))
    );
    if (response.error) {
      throw new HttpException(response.error, HttpStatus.BAD_REQUEST);
    }

    return response;
  }

  private handleMicroserviceError(err: Error) {
    if (err instanceof TimeoutError) {
      return throwError(() => new Error('Timeout'));
    }
    return throwError(() => err);
  }
}

