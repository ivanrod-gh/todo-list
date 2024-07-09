import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, IsArray, IsOptional, IsString, Length, ValidateNested } from "class-validator";
import { UpdateArrayElemValueDto } from "src/values/dto/update-array-elem-value.dto";
import { UpdateRealValueDto } from "src/values/dto/update-real-value.dto";
import { UpdateStringValueDto } from "src/values/dto/update-string-value.dto";

export class UpdateTaskDto {
  @ApiProperty({example: 'Пробежка', description: 'Уникальное (в рамках одного проекта) название задачи'})
  @IsOptional()
  @Length(2, 100, { message: 'Должно быть от 2 до 100 символов' })
  @IsString({ message: 'Должно быть строкой' })
  readonly name?: string;

  @ApiProperty({example: 'Надо пробежать 1 километр', description: 'Описание задачи'})
  @IsOptional()
  @Length(2, 100, { message: 'Должен быть от 2 до 100 символов' })
  @IsString({ message: 'Должен быть строкой' })
  readonly description?: string;

  @ApiProperty({ type: [UpdateStringValueDto], description: 'Массив объектов данных для значений строковых полей'})
  @IsArray({ message: 'Должен быть массивом' })
  @ArrayMinSize(1, { message: 'Должен содержать минимум 1 элемент' })
  @ValidateNested({ each: true })
  @Type(() => UpdateStringValueDto )
  @IsOptional()
  readonly stringValuesData?: UpdateStringValueDto[]
  
  @ApiProperty({ type: [UpdateRealValueDto], description: 'Массив объектов данных для значений числовых полей'})
  @IsArray({ message: 'Должен быть массивом' })
  @ArrayMinSize(1, { message: 'Должен содержать минимум 1 элемент' })
  @ValidateNested({ each: true })
  @Type(() => UpdateRealValueDto )
  @IsOptional()
  readonly realValuesData?: UpdateRealValueDto[]

  @ApiProperty({ type: [UpdateArrayElemValueDto], description: 'Массив объектов данных для значений массивных полей'})
  @IsArray({ message: 'Должен быть массивом' })
  @ArrayMinSize(1, { message: 'Должен содержать минимум 1 элемент' })
  @ValidateNested({ each: true })
  @Type(() => UpdateArrayElemValueDto )
  @IsOptional()
  readonly arrayElemValuesData?: UpdateArrayElemValueDto[]
}