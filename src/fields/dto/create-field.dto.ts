import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString, Length } from "class-validator";
import { FieldEnum } from "../field.entity";

export class CreateFieldDto {
  @ApiProperty({ example: 'string', description: 'Тип поля - перечисление integer или string' })
  @IsEnum(FieldEnum, { message: 'Должен быть integer или string' })
  readonly type: FieldEnum;

  @ApiProperty({ example: 'Трудозатраты', description: 'Уникальное (в рамках одного проекта) название поля' })
  @IsString({ message: 'Должно быть строкой' })
  @Length(2, 100, { message: 'Должно быть от 2 до 100 символов' })
  readonly name: string;
}