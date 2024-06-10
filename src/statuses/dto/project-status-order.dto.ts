import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

export class ProjectStatusOrderDto {
  @ApiProperty({example: '1', description: 'Вставить на определенную позицию в очередности статусов проекта'})
  @IsNumber({}, { message: 'Должен быть числом' })
  readonly orderAt: number;
}