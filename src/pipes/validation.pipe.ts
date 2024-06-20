import { ArgumentMetadata, Inject, Injectable, PipeTransform, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ValidationException } from "src/exceptions/validation.exception";
import { Project } from "src/projects/project.entity";
import { Status } from "src/statuses/status.entity";
import { User } from "src/users/user.entity";
import { CreateArrayElemValueDto } from "src/values/dto/create-array-elem-value.dto";
import { CreateRealValueDto } from "src/values/dto/create-real-value.dto";
import { CreateStringValueDto } from "src/values/dto/create-string-value.dto";
import { UpdateArrayElemValueDto } from "src/values/dto/update-array-elem-value.dto";
import { UpdateRealValueDto } from "src/values/dto/update-real-value.dto";
import { UpdateStringValueDto } from "src/values/dto/update-string-value.dto";

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
        messages[elem.property] ??= [];
        messages[elem.property].push(...Object.values(elem.constraints));
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
      if (value.stringValuesData && Array.isArray(value.stringValuesData)) {
        const valuesData = value.stringValuesData;
        const valuesType: string = 'stringValuesData';
        const dto = (this.req.method === "POST") ? CreateStringValueDto : UpdateStringValueDto
        await checkFieldValues(valuesData, valuesType, dto);
      }
      if (value.realValuesData && Array.isArray(value.realValuesData)) {
        const valuesData = value.realValuesData;
        const valuesType: string = 'realValuesData';
        const dto = (this.req.method === "POST") ? CreateRealValueDto : UpdateRealValueDto
        await checkFieldValues(valuesData, valuesType, dto);
      }
      if (value.arrayElemValuesData && Array.isArray(value.arrayElemValuesData)) {
        const valuesData = value.arrayElemValuesData;
        const valuesType: string = 'arrayElemValuesData';
        const dto = (this.req.method === "POST") ? CreateArrayElemValueDto : UpdateArrayElemValueDto
        await checkFieldValues(valuesData, valuesType, dto);
      }
      async function checkFieldValues(valuesData, valuesType: string, dto) {
        for (let fieldValue of valuesData) {
          const obj = plainToClass(dto, fieldValue);
          const errors = await validate(obj);
          if (errors.length) {
            messages[valuesType] ??= [];
            const errorsLastIndex = messages[valuesType].length;
            for (let elem of errors) {
              messages[valuesType][errorsLastIndex] ??= {};
              messages[valuesType][errorsLastIndex][elem.property] ??= [];
              messages[valuesType][errorsLastIndex][elem.property].push(...Object.values(elem.constraints));
            }
          }
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
      if (obj.type === "array" && !obj.value) {
        messages['value'] ??= [];
        messages['value'].push("Для типа поля 'array' необходимо передать значения массива");
      } else if (obj.type !== "array" && obj.value) {
        messages['value'] ??= [];
        messages['value'].push("Для всех типов полей, кроме 'array', такого ключа быть не должно");
      }
    }

    if (Object.keys(messages).length) {
      throw new ValidationException(messages)
    }

    return value;
  }
}