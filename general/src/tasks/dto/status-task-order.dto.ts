import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class StatusTaskOrderDto {
  @ApiProperty({example: '1', description: 'Вставить на определенную позицию в очередности задач статуса'})
  @IsNumber({}, { message: 'Должен быть числом' })
  readonly orderAt: number;
}