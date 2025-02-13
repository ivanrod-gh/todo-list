import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from './auth.service';
import { ResponseToken } from './dto/response-token.dto';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { CreateUserDto } from './dto/create-user.dto';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('Аутентификация')
@Controller('api/auth')
export class AuthController {

  constructor(private authService: AuthService) {}

  @ApiOperation({summary: 'Зарегистрироваться в приложении'})
  @ApiResponse({status: 200, type: [ResponseToken]})
  @UsePipes(ValidationPipe)
  @Post('/registration')
  registration(@Body() userDto: CreateUserDto): Promise<ResponseToken>  {
    return this.authService.registration(userDto);
  }

  @ApiOperation({summary: 'Войти в приложение'})
  @ApiResponse({status: 200, type: [ResponseToken]})
  @UsePipes(ValidationPipe)
  @Post('/login')
  login(@Body() userDto: CreateUserDto): Promise<ResponseToken>  {
    return this.authService.login(userDto);
  }

  @MessagePattern({ role: 'token', cmd: 'verify' })
  verifyToken(token: string) {
    return this.authService.verifyToken(token);
  }
}
