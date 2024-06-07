import { ArgumentMetadata, Injectable, PipeTransform } from "@nestjs/common";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { ValidationException } from "src/exceptions/validation.exception";

@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const obj = plainToClass(metadata.metatype, value);
    console.log(obj)
    const errors = await validate(obj);

    if (errors.length) {
      let messages = {}
      for (let elem of errors) {
        messages[elem.property]??= [Object.values(elem.constraints)];
      }
      throw new ValidationException(messages)
    }
    return value;
  }
}