import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({example: 'Спортивные задачи', description: 'Название проекта пользователя'})
  @Length(2, 100, { message: 'Должно быть от 2 до 100 символов' })
  @IsString({ message: 'Должно быть строкой' })
  readonly name: string;

  @ApiProperty({example: 'Это мои задачи, связанные со спортом', description: 'Описание проекта пользователя'})
  @IsOptional()
  @Length(2, 100, { message: 'Должен быть от 2 до 100 символов' })
  @IsString({ message: 'Должен быть строкой' })
  readonly description?: string;
}