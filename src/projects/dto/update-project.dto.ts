import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class UpdateProjectDto {
  @ApiProperty({example: 'Спортивные задачи', description: 'Название проекта пользователя'})
  @IsOptional()
  @IsString({ message: 'Должно быть строкой' })
  @Length(2, 100, { message: 'Должно быть от 2 до 100 символов' })
  readonly name?: string;

  @ApiProperty({example: 'Это мои задачи, связанные со спортом', description: 'Описание проекта пользователя'})
  @IsOptional()
  @IsString({ message: 'Должен быть строкой' })
  @Length(2, 100, { message: 'Должен быть от 2 до 100 символов' })
  readonly description?: string;
}