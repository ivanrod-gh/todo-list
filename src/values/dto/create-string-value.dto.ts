import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsString, Length, Min } from "class-validator";

export class CreateStringValueDto {
  @ApiProperty({ example: 1, description: 'Id поля, которому принадлежит значение' })
  @Min(1, { message: 'Число должно быть не менее 1' })
  @IsInt({ message: 'Должен быть целым положительным числом' })
  readonly fieldId: number;

  @ApiProperty({ example: 'Понедельник', description: 'Строковое значение поля' })
  @Length(2, 100, { message: 'Должно быть от 2 до 100 символов' })
  @IsString({ message: 'Должно быть строкой' })
  readonly value: string;
}