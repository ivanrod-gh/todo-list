import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Field } from "src/fields/field.entity";
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
        if (req.project) {
          getStatusFromProjectStatuses(req.project);
        } else {
          for (let userProject of req.user.projects) {
            project = req.user.projects[req.user.projects.indexOf(userProject)];
            getStatusFromProjectStatuses(project);
          }
        }
        function getStatusFromProjectStatuses(userProject: Project): void {
          for (let projectStatus of userProject.statuses) {
            if (projectStatus.id === reqParamsStatusId) {
              status = userProject.statuses[userProject.statuses.indexOf(projectStatus)];
              break;
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
        if (req.project) {
          getSecondStatusFromProjectStatuses(req.project);
        } else {
          for (let userProject of req.user.projects) {
            project = req.user.projects[req.user.projects.indexOf(userProject)];
            getSecondStatusFromProjectStatuses(project);
          }
        }
        function getSecondStatusFromProjectStatuses(userProject: Project): void {
          for (let projectSecondStatus of userProject.statuses) {
            if (projectSecondStatus.id === reqParamsSecondStatusId) {
              secondStatus = userProject.statuses[userProject.statuses.indexOf(projectSecondStatus)];
              break;
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
        if (req.status) {
          getTaskFromStatusTasks(req.status);
        } else {
          for (let userProject of req.user.projects) {
            project = req.user.projects[req.user.projects.indexOf(userProject)];
            for (let projectStatus of userProject.statuses) {
              status = project.statuses[project.statuses.indexOf(projectStatus)];
              getTaskFromStatusTasks(status);
            }
          }
        }
        function getTaskFromStatusTasks(projectStatus: Status): void {
          for (let statusTask of projectStatus.tasks) {
            if (statusTask.id === reqParamsTaskId) {
              task = projectStatus.tasks[projectStatus.tasks.indexOf(statusTask)];
              break;
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

      const reqParamsFieldId = +req.params.fieldId;
      if (reqParamsFieldId) {
        let field: Field;
        let project: Project;

        if (req.project) {
          getFieldFromProjectFields(req.project);
        } else {
          for (let userProject of req.user.projects) {
            project = req.user.projects[req.user.projects.indexOf(userProject)];
            getFieldFromProjectFields(project);
          }
        }
        function getFieldFromProjectFields(userProject: Project): void {
          for (let projectField of userProject.fields) {
            if (projectField.id === reqParamsFieldId) {
              field = userProject.fields[userProject.fields.indexOf(projectField)];
              break;
            }
          }
        }
        if (!field) {
          throw new Error('NoFieldFound');
        } else {
          req.field ??= field;
          req.project ??= project;
        }
      }

      if (req.body.stringValuesData && Array.isArray(req.body.stringValuesData)) {
        const valuesData = req.body.stringValuesData;
        const valuesType: string = 'string';
        checkFieldValues(valuesData, valuesType);
      }
      if (req.body.realValuesData && Array.isArray(req.body.realValuesData)) {
        const valuesData = req.body.realValuesData;
        const valuesType: string = 'real';
        checkFieldValues(valuesData, valuesType);
      }
      if (req.body.arrayElemValuesData && Array.isArray(req.body.arrayElemValuesData)) {
        const valuesData = req.body.arrayElemValuesData;
        const valuesType: string = 'array';
        checkFieldValues(valuesData, valuesType);
      }
      function checkFieldValues(valuesData, valuesType: string) {
        const fieldIds = [];
        const arrayElemValuesData = {};
        for (let valueData of valuesData) {
          if (valueData.fieldId && typeof valueData.fieldId === "number") {
            if (fieldIds.includes(valueData.fieldId)) {
              throw new Error('DoubleFieldIdFound');
            }
            fieldIds.push(valueData.fieldId);
            if (valuesType === 'array') {
              arrayElemValuesData[valueData.fieldId] = valueData.value;
            }
          }
        }
        for (let field of req.project.fields) {
          if (fieldIds.includes(field.id)) {
            if (field.type !== valuesType) {
              throw new Error('InvalidFieldType');
            }
            if (valuesType === 'array' && !field.values.includes(arrayElemValuesData[field.id])) {
              throw new Error('StringNotFoundInFieldValue');
            }
            fieldIds.splice(fieldIds.indexOf(field.id), 1);
          }
        }
        if (fieldIds.length) {
          throw new Error('NoFieldFound');
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
      } else if (err.message === "NoFieldFound") {
        throw new HttpException('Указанное поле проекта не найдено', HttpStatus.BAD_REQUEST);
      } else if (err.message === "DoubleFieldIdFound") {
        throw new HttpException('Идентификатор поля указан более 1 раза', HttpStatus.BAD_REQUEST);
      } else if (err.message === "InvalidFieldType") {
        throw new HttpException('Указано поле неверного типа', HttpStatus.BAD_REQUEST);
      } else if (err.message === "StringNotFoundInFieldValue") {
        throw new HttpException('Указанное поле не содержит переданной строки', HttpStatus.BAD_REQUEST);
      }  else {
        throw new HttpException('Неавторизованный доступ', HttpStatus.FORBIDDEN);
      }
    }
  }
}