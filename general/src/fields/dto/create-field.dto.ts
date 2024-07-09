import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsEnum, IsOptional, IsString, Length, NotContains } from "class-validator";
import { FieldEnum } from "../field.entity";

export class CreateFieldDto {
  @ApiProperty({ example: 'string', description: "Тип поля - 'real', 'string' или 'array'", type: 'string' })
  @IsEnum(FieldEnum, { message: "Должен быть 'real', 'string' или 'array'" })
  @IsString({ message: 'Должно быть строкой' })
  readonly type: FieldEnum;

  @ApiProperty({ example: 'День недели', description: 'Уникальное (в рамках одного проекта) название поля' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(2, 100, { message: 'Должно быть от 2 до 100 символов' })
  readonly name: string;

  @ApiProperty({ example: "['Медленно', 'Быстро']", description: "Простой массив значений для типа поля 'array'" })
  @IsArray({ message: 'Должен быть массивом' })
  @ArrayMinSize(2, { message: 'Должен содержать минимум 2 элемента' })
  @IsString({ each: true, message: 'Каждый элемент массива должен быть строкой' })
  @NotContains(',', { each: true, message: 'Запятые внутри строк запрещены' })
  @Length(2, 100, { each: true, message: 'Строки должны быть от 2 до 100 символов' })
  @IsOptional()
  readonly values?: string[];
}