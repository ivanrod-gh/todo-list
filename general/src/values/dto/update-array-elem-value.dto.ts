import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsOptional, IsString, Length, Min } from "class-validator";

export class UpdateArrayElemValueDto {
  @ApiProperty({ example: 1, description: 'Id поля, которому принадлежит значение' })
  @Min(1, { message: 'Число должно быть не менее 1' })
  @IsInt({ message: 'Должен быть целым положительным числом' })
  readonly fieldId: number;

  @ApiProperty({ example: 'Медленно', description: 'Строковое значение поля' })
  @Length(2, 100, { message: 'Должно быть от 2 до 100 символов' })
  @IsString({ message: 'Должно быть строкой' })
  readonly value: string;

  @ApiProperty({ example: false, description: 'Флаг (true или false) для уничтожения значения поля' })
  @IsOptional()
  @IsBoolean({ message: 'Должен быть true или false' })
  readonly destroy?: boolean;
}