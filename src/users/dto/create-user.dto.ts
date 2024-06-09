import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class CreateUserDto {
  @ApiProperty({example: 'some@mail.ru', description: 'Почта пользователя'})
  @IsString({ message: 'Должна быть строкой' })
  @IsEmail({}, { message: 'Некорректная почта' })
  readonly email: string;

  @ApiProperty({example: '1234567', description: 'Незашифрованный пароль пользователя'})
  @IsString({ message: 'Должен быть строкой' })
  @Length(5, 20, { message: 'Должен быть от 5 до 20 символов' })
  readonly password: string;
}