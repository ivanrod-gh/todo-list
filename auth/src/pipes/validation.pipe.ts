import { ArgumentMetadata, Inject, Injectable, PipeTransform, Scope } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ValidationException } from "src/exceptions/validation.exception";

@Injectable({scope: Scope.REQUEST})
export class ValidationPipe implements PipeTransform {

  constructor() {}

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

    if (Object.keys(messages).length) {
      throw new ValidationException(messages)
    }

    return value;
  }
}