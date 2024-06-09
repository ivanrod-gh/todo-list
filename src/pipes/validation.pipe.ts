import { ArgumentMetadata, Inject, Injectable, PipeTransform, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ValidationException } from "src/exceptions/validation.exception";
import { User } from "src/users/user.entity";

@Injectable({scope: Scope.REQUEST})
export class ValidationPipe implements PipeTransform {
  constructor(@Inject(REQUEST) private req: Request & { user: User }) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    console.log('CALL ValidationPipe')
    
    if (metadata.type !== 'body') {
      return value;
    }

    const obj = plainToClass(metadata.metatype, value);
    const errors = await validate(obj);


    let messages = {}
    if (errors.length) {
      for (let elem of errors) {
        messages[elem.property]??= [];
        messages[elem.property].push(...Object.values(elem.constraints));
      }
    }

    if (metadata.metatype.name === 'CreateProjectDto' || metadata.metatype.name === 'UpdateProjectDto') {
      for (let elem of this.req.user.projects) {
        if (elem.name === obj.name) {
          messages['name']??= [];
          messages['name'].push('Проект с таким именем уже существует');
          break;
        }
      }
    }

    if (Object.keys(messages).length) {
      throw new ValidationException(messages)
    }

    return value;
  }
}