import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Length } from "class-validator";

export class UpdateFieldDto {
  @ApiProperty({ example: 'День недели', description: 'Уникальное (в рамках одного проекта) название поля' })
  @IsOptional()
  @IsString({ message: 'Должно быть строкой' })
  @Length(2, 100, { message: 'Должно быть от 2 до 100 символов' })
  readonly name?: string;
}