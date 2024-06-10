import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class UpdateStatusDto {
  @ApiProperty({example: 'Сделать', description: 'Название для статуса однородных задач'})
  @IsOptional()
  @IsString({ message: 'Должно быть строкой' })
  @Length(2, 100, { message: 'Должно быть от 2 до 100 символов' })
  readonly name?: string;

  @ApiProperty({example: 'Задачи, которые необходимо начать выполнять', description: 'Описание статуса задач'})
  @IsOptional()
  @IsString({ message: 'Должен быть строкой' })
  @Length(2, 100, { message: 'Должен быть от 2 до 100 символов' })
  readonly description?: string;
}