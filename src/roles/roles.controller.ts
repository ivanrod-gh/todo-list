import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from './role.entity';
import { RolesService } from './roles.service';
import { Roles } from 'src/decorators/roles-auth.decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { JWTAuthGuard } from 'src/guards/jwt-auth.guard';

@ApiTags('Роли')
@Roles('ADMIN')
@Controller('api/roles')
export class RolesController {

  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({ summary: 'Получить все роли' })
  @ApiResponse({ status: 200, type: [Role] })
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get()
  getAll() {
    return this.rolesService.getAll();
  }
}
