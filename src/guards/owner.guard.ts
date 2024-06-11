import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Project } from "src/projects/project.entity";
import { Status } from "src/statuses/status.entity";
import { Task } from "src/tasks/task.entity";

@Injectable()
export class OwnerGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    try {
      const req = context.switchToHttp().getRequest();
      const reqUserId = req.user.id;

      const reqParamsUserId = +req.params.userId;
      if (reqParamsUserId && reqUserId !== reqParamsUserId) {
        throw new Error();
      }

      const reqParamsProjectId = +req.params.projectId;
      if (reqParamsProjectId) {
        let project: Project;
        for (let userProject of req.user.projects) {
          if (userProject.id === reqParamsProjectId) {
            project = req.user.projects[req.user.projects.indexOf(userProject)];
            break;
          }
        }
        if (!project) {
          throw new Error('NoProjectFound');
        } else {
          req.project ??= project;
        }
      }

      const reqParamsStatusId = +req.params.statusId;
      if (reqParamsStatusId) {
        let status: Status;
        let project: Project;
        label:
        for (let userProject of req.user.projects) {
          project = req.user.projects[req.user.projects.indexOf(userProject)];
          for (let userStatus of userProject.statuses) {
            if (userStatus.id === reqParamsStatusId) {
              status = project.statuses[project.statuses.indexOf(userStatus)];
              break label;
            }
          }
        }
        if (!status) {
          throw new Error('NoStatusFound');
        } else {
          req.status ??= status;
          req.project ??= project;
        }
      }

      const reqParamsSecondStatusId = +req.params.secondStatusId;
      if (reqParamsSecondStatusId) {
        let secondStatus: Status;
        let project: Project;
        label:
        for (let userProject of req.user.projects) {
          project = req.user.projects[req.user.projects.indexOf(userProject)];
          for (let userStatus of userProject.statuses) {
            if (userStatus.id === reqParamsSecondStatusId) {
              secondStatus = project.statuses[project.statuses.indexOf(userStatus)];
              break label;
            }
          }
        }
        if (!secondStatus) {
          throw new Error('NoSecondStatusFound');
        } else {
          req.secondStatus ??= secondStatus;
          req.project ??= project;
        }
      }

      const reqParamsTaskId = +req.params.taskId;
      if (reqParamsTaskId) {
        let task: Task;
        let status: Status;
        let project: Project;
        label:
        for (let userProject of req.user.projects) {
          project = req.user.projects[req.user.projects.indexOf(userProject)];
          for (let userStatus of userProject.statuses) {
            status = project.statuses[project.statuses.indexOf(userStatus)];
            for (let userTask of userStatus.tasks) {
              if (userTask.id === reqParamsTaskId) {
                task = status.tasks[status.tasks.indexOf(userTask)];
                break label;
              }
            }
          }
        }
        if (!task) {
          throw new Error('NoTaskFound');
        } else {
          req.task ??= task;
          req.status ??= status;
          req.project ??= project;
        }
      }

      return true;
    } catch (err) {
      if (err.message === "NoProjectFound") {
        throw new HttpException('Указанный проект пользователя не найден', HttpStatus.BAD_REQUEST);
      } else if (err.message === "NoStatusFound") {
        throw new HttpException('Указанный статус проекта не найден', HttpStatus.BAD_REQUEST);
      } else if (err.message === "NoSecondStatusFound") {
        throw new HttpException('Второй из указанных статусов проекта не найден', HttpStatus.BAD_REQUEST);
      } else if (err.message === "NoTaskFound") {
        throw new HttpException('Указанная задача статуса не найдена', HttpStatus.BAD_REQUEST);
      } else {
        throw new HttpException('Неавторизованный доступ', HttpStatus.FORBIDDEN);
      }
    }
  }
}