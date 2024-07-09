import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
  @ApiProperty({example: 'some@mail.ru', description: 'Почта пользователя'})
  @IsEmail({}, { message: 'Некорректная почта' })
  @IsString({ message: 'Должна быть строкой' })
  readonly email: string;

  @ApiProperty({example: '1234567', description: 'Незашифрованный пароль пользователя'})
  @Length(5, 20, { message: 'Должен быть от 5 до 20 символов' })
  @IsString({ message: 'Должен быть строкой' })
  readonly password: string;
}