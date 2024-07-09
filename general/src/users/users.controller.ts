import { Controller, Get, Post, Body, UseGuards, UsePipes, Inject, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from "./dto/create-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from './user.entity';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { Roles } from 'src/decorators/roles-auth.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { JWTAuthGuard } from 'src/guards/jwt-auth.guard';
import { MessagePattern } from '@nestjs/microservices';

@ApiTags('Пользователи')
@Roles('ADMIN')
@Controller('api/users')
export class UsersController {

  constructor(
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({summary: '[Админ] Создание пользователя'})
  @ApiResponse({status: 201, type: User})
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.usersService.create(userDto);
  }

  @ApiOperation({summary: '[Админ] Получить всех пользователей'})
  @ApiResponse({status: 200, type: [User]})
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get()
  getAll() {
    return this.usersService.getAll();
  }

  @MessagePattern({ role: 'user', cmd: 'get' })
  getUser(email: string) {
    return this.usersService.getUserByEmail(email);
  }

  @MessagePattern({ role: 'user', cmd: 'get', feature: 'with password' })
  getUserWithPassword(email: string) {
    return this.usersService.getUserByEmailWithPassword(email);
  }

  @MessagePattern({ role: 'user', cmd: 'create' })
  createNewUser(dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}
