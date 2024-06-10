import { Controller, Get, Post, Body, UseGuards, UsePipes } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from "./dto/create-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { User } from './user.entity';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { Roles } from 'src/decorators/roles-auth.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { JWTAuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('Пользователи')
@Roles('ADMIN')
@Controller('api/users')
export class UsersController {

  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({summary: 'Создание пользователя'})
  @ApiResponse({status: 200, type: User})
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.usersService.create(userDto);
  }

  @ApiOperation({summary: 'Получить всех пользователей'})
  @ApiResponse({status: 200, type: [User]})
  @UsePipes(ValidationPipe)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get()
  getAll() {
    return this.usersService.getAll();
  }
}
