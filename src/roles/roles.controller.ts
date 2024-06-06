import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Role } from './role.entity';
import { RolesService } from './roles.service';

@ApiTags('Роли')
@Controller('api/roles')
export class RolesController {

  constructor(private readonly rolesService: RolesService) {}

  @ApiOperation({summary: 'Получить все роли'})
  @ApiResponse({status: 200, type: [Role]})
  @Get()
  getAll() {
    return this.rolesService.getAll();
  }
}
