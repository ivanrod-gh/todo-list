import { ArgumentMetadata, Inject, Injectable, PipeTransform, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ValidationException } from "src/exceptions/validation.exception";
import { Project } from "src/projects/project.entity";
import { Status } from "src/statuses/status.entity";
import { User } from "src/users/user.entity";

@Injectable({scope: Scope.REQUEST})
export class ValidationPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private req: Request & { 
    user: User,
    project: Project,
    status: Status,
    params: any,
  }) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    const obj = plainToClass(metadata.metatype, value);
    const errors = await validate(obj);

    let messages = {}
    if (errors.length) {
      for (let elem of errors) {
        if (elem.children.length) {
          for (let child of elem.children) {
            if (child.children.length) {
              for (let childElem of child.children) {
                const index = elem[childElem.property].indexOf(childElem.target);
                messages[elem.property] ??= {};
                messages[elem.property][index] ??= {};
                messages[elem.property][index][childElem.property] ??= [];
                messages[elem.property][index][childElem.property].push(...Object.values(childElem.constraints));
              }
            }
          }
        } else {
          messages[elem.property] ??= [];
          messages[elem.property].push(...Object.values(elem.constraints));
        }
      }
    }

    if (metadata.metatype.name === 'CreateProjectDto' || metadata.metatype.name === 'UpdateProjectDto') {
      for (let project of this.req.user.projects) {
        if (project.name === obj.name) {
          messages['name'] ??= [];
          messages['name'].push('Проект с таким именем уже существует');
          break;
        }
      }
    }
    
    if (metadata.metatype.name === 'CreateStatusDto' || metadata.metatype.name === 'UpdateStatusDto') {
      for (let status of this.req.project.statuses) {
        if (status.name === obj.name) {
          messages['name'] ??= [];
          messages['name'].push('Статус с таким именем уже существует');
          break;
        }
      }
    }

    if (metadata.metatype.name === 'CreateTaskDto' || metadata.metatype.name === 'UpdateTaskDto') {
      for (let task of this.req.status.tasks) {
        if (task.name === obj.name) {
          messages['name'] ??= [];
          messages['name'].push('Задача с таким именем уже существует');
          break;
        }
      }
    }

    if (metadata.metatype.name === 'CreateFieldDto' || metadata.metatype.name === 'UpdateFieldDto') {
      for (let field of this.req.project.fields) {
        if (field.name === obj.name) {
          messages['name'] ??= [];
          messages['name'].push('Поле с таким именем уже существует');
          break;
        }
      }
    }
    if (metadata.metatype.name === 'CreateFieldDto') {
      if (obj.type === "array" && !obj.values) {
        messages['values'] ??= [];
        messages['values'].push("Для типа поля 'array' необходимо передать значения массива");
      } else if (obj.type !== "array" && obj.values) {
        messages['values'] ??= [];
        messages['values'].push("Для всех типов полей, кроме 'array', такого ключа быть не должно");
      }
    }

    if (Object.keys(messages).length) {
      throw new ValidationException(messages)
    }

    return value;
  }
}