import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsOptional, IsString, Length } from "class-validator";
import { CreateArrayElemValueDto } from "src/values/dto/create-array-elem-value.dto";
import { CreateRealValueDto } from "src/values/dto/create-real-value.dto";
import { CreateStringValueDto } from "src/values/dto/create-string-value.dto";

export class CreateTaskDto {
  @ApiProperty({example: 'Пробежка', description: 'Уникальное (в рамках одного проекта) название задачи'})
  @Length(2, 100, { message: 'Должно быть от 2 до 100 символов' })
  @IsString({ message: 'Должно быть строкой' })
  readonly name: string;

  @ApiProperty({example: 'Надо пробежать 1 километр', description: 'Описание задачи'})
  @IsOptional()
  @Length(2, 100, { message: 'Должен быть от 2 до 100 символов' })
  @IsString({ message: 'Должен быть строкой' })
  readonly description?: string;

  @ApiProperty({ type: [CreateStringValueDto], description: 'Массив объектов данных для значений строковых полей'})
  @IsArray({ message: 'Должен быть массивом' })
  @ArrayMinSize(1, { message: 'Должен содержать минимум 1 элемент' })
  @IsOptional()
  readonly stringValuesData?: [CreateStringValueDto]

  @ApiProperty({ type: [CreateRealValueDto], description: 'Массив объектов данных для значений числовых полей'})
  @IsArray({ message: 'Должен быть массивом' })
  @ArrayMinSize(1, { message: 'Должен содержать минимум 1 элемент' })
  @IsOptional()
  readonly realValuesData?: [CreateRealValueDto]

  @ApiProperty({ type: [CreateArrayElemValueDto], description: 'Массив объектов данных для значений массивных полей'})
  @IsArray({ message: 'Должен быть массивом' })
  @ArrayMinSize(1, { message: 'Должен содержать минимум 1 элемент' })
  @IsOptional()
  readonly arrayElemValuesData?: [CreateArrayElemValueDto]
}