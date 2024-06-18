import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsInt, IsNumber, IsOptional, Min } from "class-validator";

export class UpdateRealValueDto {
  @ApiProperty({ example: 1, description: 'Id поля, которому принадлежит значение' })
  @Min(1, { message: 'Число должно быть не менее 1' })
  @IsInt({ message: 'Должен быть целым положительным числом' })
  readonly fieldId: number;

  @ApiProperty({ example: 10, description: 'Числовое значение поля' })
  @IsNumber({}, { message: 'Должен быть числом' })
  readonly value: number;

  @ApiProperty({ example: true, description: 'Флаг (true или false) для уничтожения значения поля' })
  @IsOptional()
  @IsBoolean({ message: 'Должен быть true или false' })
  readonly destroy?: boolean;
}