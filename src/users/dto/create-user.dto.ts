import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({example: 'some@mail.ru', description: 'Почта пользователя'})
  readonly email: string;

  @ApiProperty({example: '1234567', description: 'Незашифрованный пароль пользователя'})
  readonly password: string;
}