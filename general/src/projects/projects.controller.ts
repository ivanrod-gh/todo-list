import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Req, UseGuards, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './project.entity';
import { ValidationPipe } from 'src/pipes/validation.pipe';
import { UpdateProjectDto } from './dto/update-project.dto';
import { OwnerGuard } from 'src/guards/owner.guard';
import { JWTAuthGuard } from 'src/guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles-auth.decorator';
import { RolesGuard } from 'src/guards/roles.guard';

@ApiTags('Проекты')
@Roles('ADMIN', 'USER')
@Controller('api/:userId/projects')
export class ProjectsController {
  
  constructor(private readonly projectService: ProjectsService) {}

  @ApiOperation({ summary: 'Создать проект пользователя' })
  @ApiResponse({ status: 201, type: Project })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Post()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() dto: CreateProjectDto
  ) {
    return this.projectService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Получить все проекты пользователя' })
  @ApiResponse({ status: 200, type: [Project] })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get()
  getAll(@Param('userId', ParseIntPipe) userId: number) {
    return this.projectService.getAll(userId);
  }

  @ApiOperation({ summary: 'Получить проект пользователя' })
  @ApiResponse({ status: 200, type: Project })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Get(':projectId')
  getOne(
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.projectService.getOne(projectId);
  }

  @ApiOperation({ summary: 'Изменить проект пользователя' })
  @ApiResponse({ status: 200, description: 'Проект с id [1] успешно обновлен' })
  @UsePipes(ValidationPipe)
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Put(':projectId')
  update(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: UpdateProjectDto
  ) {
    return this.projectService.update(projectId, dto);
  }

  @ApiOperation({ summary: 'Удалить проект пользователя' })
  @ApiResponse({ status: 200, description: `Проект с id [1] успешно удален` })
  @UseGuards(OwnerGuard)
  @UseGuards(RolesGuard)
  @UseGuards(JWTAuthGuard)
  @Delete(':projectId')
  delete(
    @Req() req: Request & { project: Project },
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.projectService.delete(req, projectId);
  }
}
