import { ApiProperty } from "@nestjs/swagger";

export class ResponseToken {
  @ApiProperty({example: 'jes57k6w43skej57se47xke46masejxy', description: 'JWT токен'})
  readonly token: string;
}