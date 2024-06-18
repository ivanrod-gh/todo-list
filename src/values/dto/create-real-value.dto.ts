import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNumber, Min } from "class-validator";

export class CreateRealValueDto {
  @ApiProperty({ example: 1, description: 'Id поля, которому принадлежит значение' })
  @Min(1, { message: 'Число должно быть не менее 1' })
  @IsInt({ message: 'Должен быть целым числом' })
  readonly fieldId: number;

  @ApiProperty({ example: 10, description: 'Числовое значение поля' })
  @IsNumber({}, { message: 'Должен быть числом' })
  readonly value: number;
}